const { getLanguageById, SubmitBatch, submitToken } = require("../utils/problemUtility");
const Problem = require("../models/problem")
const User = require("../models/user");
const Submission = require("../models/submission");
const SolutionVideo = require("../models/solutionVideo");


const createProblem = async (req, res) => {
    const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution } = req.body;
    try {
        //array iteration every elemeny
        for (const { language, completeCode } of referenceSolution) {

            if (!language || !completeCode) {
                return res.status(400).send("Missing language or completeCode in referenceSolution.");
            }

            // langauge id
            const languageId = getLanguageById(language);
            console.log(languageId)

            // submission array creating
            const submission = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output,
            }));


            const submitResult = await SubmitBatch(submission);

            if (!submitResult || !Array.isArray(submitResult)) {
                return res.status(500).send("Judge0 submission failed or no result returned.");
            }

            const resultToken = submitResult.map((value) => value.token); // creates the array and returns the token
            // console.log(resultToken)
            const testResult = await submitToken(resultToken)
            console.log(testResult)

            // check the test cases
            for (let i = 0; i < testResult.length; i++) {
                const test = testResult[i];
                if (test.status_id !== 3) {
                    const failedTestCase = visibleTestCases[i];
                    return res.status(400).json({
                        message: `Reference solution for ${language} failed on a visible test case.`,
                        details: {
                            language,
                            testCase: {
                                input: failedTestCase.input,
                                expectedOutput: failedTestCase.output,
                            },
                            result: {
                                status: test.status,
                                stdout: test.stdout,
                                stderr: test.stderr,
                            },
                        },
                    });
                }
            }
        }

        //  storing the problem into database
        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id,
        })


        res.status(201).send("Problem Created Successfully");


    } catch (err) {
        res.status(401).send("Error Occured " + err)
    }
}


const updateProblem = async (req, res) => {
    const { id } = req.params
    const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution } = req.body;

    try {

        if (!id)
            return res.status(404).send("Id is Missing");

        const getProblem = Problem.findById(id);

        if (!getProblem) {
            return res.status(403).send("Problem is Missing");
        }

        for (const { language, completeCode } of referenceSolution) {

            if (!language || !completeCode) {
                return res.status(400).send("Missing language or completeCode in referenceSolution.");
            }

            // langauge id
            const languageId = getLanguageById(language);
            console.log(languageId)

            // submission array creating
            const submission = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output,
            }));


            const submitResult = await SubmitBatch(submission);

            if (!submitResult || !Array.isArray(submitResult)) {
                return res.status(500).send("Judge0 submission failed or no result returned.");
            }

            const resultToken = submitResult.map((value) => value.token); // creates the array and returns the token
            // console.log(resultToken)
            const testResult = await submitToken(resultToken)
            console.log(testResult)

            // check the test cases
            for (const test of testResult) {
                if (test.status_id != 3)
                    return res.status(400).send("Error Occured Status_code is not equal to 3 ");
            }

            // update the problem 
            const newProblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true });

            res.status(200).send(newProblem)

        }
    } catch (err) {
        res.statu(403).send("Error Occured " + err);
    }
}

const deleteProblem = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id)
            return res.status(404).send("Id is Missing");

        const getProblem = Problem.findById(id);

        if (!getProblem) {
            return res.status(403).send("Problem is Missing");
        }

        const deleteProblem = await Problem.findByIdAndDelete(id);

        if (!deleteProblem)
            return res.status(500).send("Problem is Missing Cannot be deleted");

        res.status(200).send("Problem Deleted Successfully");

    } catch (err) {
        res.status(404).send("Error Occured " + err);
    }
}




const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.result._id;

        if (!id)
            return res.status(403).send("Id is Missing");

        const getProblem = await Problem.findById(id).select(
            "title description difficulty tags visibleTestCases startCode referenceSolution secureUrl thumbnailUrl duration"
        );

        if (!getProblem)
            return res.status(403).send("Problem is Missing");

        // Fetch video metadata for this problem and user
        const video = await SolutionVideo.findOne({ problemId: id, userId });

        let videoData = null;
        if (video) {
            videoData = {
                secureUrl: video.secureUrl,
                thumbnailUrl: video.thumbnailUrl,
                duration: video.duration,
            };
        }

        // Combine problem data with video metadata
        const responseData = {
            ...getProblem.toObject(),
            video: videoData,
        };

        res.status(200).send(responseData);

    } catch (err) {
        console.error("Error fetching problem by ID:", err);
        res.status(500).send("Error Occurred: " + err.message);
    }
};


const getAllProblems = async (req, res) => {
    try {

        const getProblems = await Problem.find({}).select("_id title tags difficulty");

        if (!getProblems)
            return res.status(403).send("Problems are Missing");

        res.status(200).send(getProblems)

    } catch (err) {
        res.status(500).send("Error Occured " + err);
    }
}

const problemsSolvedByUser = async (req, res) => {
    try {
        const userId = req.result._id;
        console.log("problemsSolvedByUser: Fetching solved problems for userId:", userId);

        console.log("problemsSolvedByUser: User ID type:", typeof userId);
        console.log("problemsSolvedByUser: User ID value:", userId);

        // First get the user without population to check the raw problemSolved array
        const rawUser = await User.findById(userId);
        if (rawUser) {
            console.log("problemsSolvedByUser: Raw problemSolved array:",
                rawUser.problemSolved.map(id => id.toString()));
        }

        // Now get the populated user
        const user = await User.findById(userId).populate({
            path: "problemSolved",
            select: "_id title difficulty tags"
        });

        if (user && user.problemSolved) {
            console.log("problemsSolvedByUser: Populated problemSolved array length:", user.problemSolved.length);
            console.log("problemsSolvedByUser: First few problems:",
                user.problemSolved.slice(0, 3).map(p => ({ id: p._id, title: p.title })));
        }

        if (!user) {
            console.error("problemsSolvedByUser: User not found");
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log(`problemsSolvedByUser: Found ${user.problemSolved.length} solved problems`);
        res.status(200).json({
            success: true,
            problems: user.problemSolved
        });

    } catch (err) {
        console.error("problemsSolvedByUser: Error occurred:", err);
        res.status(500).json({
            success: false,
            message: "Error occurred while fetching solved problems",
            error: err.message
        });
    }
}

const submittedProblem = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.pid;

        const ans = await Submission.find({ userId, problemId });

        res.status(200).send(ans);

    } catch (err) {
        res.status(403).send("Error Occured " + err);
    }
}



module.exports = { createProblem, updateProblem, deleteProblem, getAllProblems, getProblemById, problemsSolvedByUser, submittedProblem }
