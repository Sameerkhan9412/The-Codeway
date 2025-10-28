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

            // submission array creating - manual output comparison
            const submission = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                // expected_output: testcase.output, // Removed - manual comparison
            }));
            const submitResult = await SubmitBatch(submission);
            if (!submitResult || !Array.isArray(submitResult)) {
                return res.status(500).send("Judge0 submission failed or no result returned.");
            }

            const resultToken = submitResult.map((value) => value.token); // creates the array and returns the token
            const testResult = await submitToken(resultToken)

            // check the test cases with manual output comparison
            for (let i = 0; i < testResult.length; i++) {
                const test = testResult[i];
                const statusId = test.status?.id || test.status_id;
                const expectedOutput = visibleTestCases[i].output;
                const actualOutput = test.stdout;

                // Normalize outputs for comparison
                const normalizedExpected = expectedOutput?.trim() || '';
                const normalizedActual = actualOutput?.trim() || '';

                if (statusId !== 3 || normalizedExpected !== normalizedActual) {
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
                                actualOutput: normalizedActual,
                                expectedOutput: normalizedExpected,
                                outputMatch: normalizedExpected === normalizedActual
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

            // submission array creating - manual output comparison
            const submission = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                // expected_output: testcase.output, // Removed - manual comparison
            }));


            const submitResult = await SubmitBatch(submission);

            if (!submitResult || !Array.isArray(submitResult)) {
                return res.status(500).send("Judge0 submission failed or no result returned.");
            }

            const resultToken = submitResult.map((value) => value.token); // creates the array and returns the token
            const testResult = await submitToken(resultToken)

            // check the test cases with manual output comparison
            for (let i = 0; i < testResult.length; i++) {
                const test = testResult[i];
                const statusId = test.status?.id || test.status_id;
                const expectedOutput = visibleTestCases[i].output;
                const actualOutput = test.stdout;

                // Normalize outputs for comparison
                const normalizedExpected = expectedOutput?.trim() || '';
                const normalizedActual = actualOutput?.trim() || '';

                if (statusId != 3 || normalizedExpected !== normalizedActual) {
                    return res.status(400).send(`Reference solution for ${language} failed on test case ${i + 1}. Expected: "${normalizedExpected}", Got: "${normalizedActual}"`);
                }
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

        // First get the user without population to check the raw problemSolved array
        const rawUser = await User.findById(userId);
        if (rawUser) {
                rawUser.problemSolved.map(id => id.toString());
        }

        // Now get the populated user
        const user = await User.findById(userId).populate({
            path: "problemSolved",
            select: "_id title difficulty tags"
        });

        if (user && user.problemSolved) {
                user.problemSolved.slice(0, 3).map(p => ({ id: p._id, title: p.title }));
        }

        if (!user) {
            console.error("problemsSolvedByUser: User not found");
            return res.status(404).json({ success: false, message: "User not found" });
        }
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

// Add these new controller methods to your existing file

/**
 * Get problems solved by user with additional details for profile
 */
const getProfileProblemsSolved = async (req, res) => {
    try {
        const userId = req.result._id;

        // Get all accepted submissions for the user
        const submissions = await Submission.find({
            userId,
            status: 'Accepted'
        }).select('problemId createdAt -_id'); // Select only necessary fields

        // We no longer need to fetch problem details here as we're just counting submissions per day.
        // The frontend will receive a list of submissions with dates.

        // Map submissions to a simpler format for the heatmap
        const activity = submissions.map(submission => ({
            date: submission.createdAt, // Rename to 'date' to match frontend
            count: 1 // Each submission counts as one activity
        }));

        // Aggregate counts per day, adjusting for a common +5:30 timezone offset
        const aggregatedActivity = activity.reduce((acc, curr) => {
            const date = new Date(curr.date);
            // Manually adjust for a common timezone, e.g., UTC+5:30
            // A more robust solution would use a library like moment-timezone
            const offset = 5.5 * 60 * 60 * 1000;
            const adjustedDate = new Date(date.getTime() + offset);
            const dateStr = adjustedDate.toISOString().split('T')[0];
            
            if (!acc[dateStr]) {
                acc[dateStr] = { date: dateStr, count: 0 };
            }
            acc[dateStr].count += 1;
            return acc;
        }, {});

        res.status(200).json({
            count: submissions.length,
            // The key should be 'activity' to match frontend expectations
            activity: Object.values(aggregatedActivity)
        });
    } catch (err) {
        console.error("Error in getProfileProblemsSolved:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get all problems with additional stats for profile
 */
const getProfileAllProblems = async (req, res) => {
    try {
        const userId = req.result._id;

        // Get all problems
        const allProblems = await Problem.find({})
            .select('_id title difficulty tags');

        // Get problems solved by user
        const solvedSubmissions = await Submission.find({
            userId,
            status: 'Accepted'
        });
        const solvedProblemIds = [...new Set(solvedSubmissions.map(s => s.problemId))];

        // Get problems user is attempting but not solved
        const attemptingSubmissions = await Submission.find({
            userId,
            status: { $ne: 'Accepted' }
        });
        const attemptingProblemIds = [...new Set(attemptingSubmissions.map(s => s.problemId))];

        // Add solved and attempting status to each problem
        const problemsWithStatus = allProblems.map(problem => {
            const isSolved = solvedProblemIds.some(id => id.equals(problem._id));
            const isAttempting = !isSolved && attemptingProblemIds.some(id => id.equals(problem._id));
            return {
                ...problem.toObject(),
                isSolved,
                isAttempting
            };
        });

        // Calculate stats
        const totalProblems = problemsWithStatus.length;
        const solvedCount = problemsWithStatus.filter(p => p.isSolved).length;
        const unsolvedCount = totalProblems - solvedCount;
        const easy = problemsWithStatus.filter(p => p.difficulty === 'easy').length;
        const medium = problemsWithStatus.filter(p => p.difficulty === 'medium').length;
        const hard = problemsWithStatus.filter(p => p.difficulty === 'hard').length;
        const attempting = problemsWithStatus.filter(p => p.isAttempting).length;

        res.status(200).json({
            totalProblems,
            solvedCount,
            unsolvedCount,
            easy,
            medium,
            hard,
            attempting,
            problems: problemsWithStatus
        });
    } catch (err) {
        console.error("Error in getProfileAllProblems:", err);
        res.status(500).json({ error: err.message });
    }
};


module.exports = { createProblem, updateProblem, deleteProblem, getAllProblems, getProblemById, problemsSolvedByUser, submittedProblem, getProfileAllProblems, getProfileProblemsSolved }
