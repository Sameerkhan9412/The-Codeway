const Problem = require("../models/problem")
const Submission = require("../models/submission")
const User = require("../models/user")
const { getLanguageById, submitToken, SubmitBatch } = require("../utils/problemUtility")
const { getIO } = require('../config/socket');



const submitCode = async (req, res) => {
    try {

        const userId = req.result._id;

        const problemId = req.params.id;

        let { code, language } = req.body;

        if (!userId || !problemId || !code || !language) {
            console.log("submitCode: Missing fields");
            return res.status(401).send("Fields Are Missing");
        }

        if (language === 'cpp')
            language = 'c++';

        //fetch the problem from database
        const problem = await Problem.findById(problemId);
        if (!problem) {
            console.log("submitCode: Problem not found");
            return res.status(404).send("Problem not found");
        }
        console.log("submitCode: Problem found");

        // first saving into the database if there is an issue in the judge0 first it should be saved as an pending
        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: "Pending",
            totalTestCases: problem.hiddenTestCases.length,
        });
        console.log("submitCode: Submission created with pending status");

        //now judge0 code submit 
        const languageId = await getLanguageById(language);
        if (!languageId) {
            // console.log("submitCode: Invalid language id");
            return res.status(404).send(" Invalid Language Id");
        }
        console.log("submitCode: Language ID found:", languageId);

        if (!problem.hiddenTestCases || problem.hiddenTestCases.length === 0) {
            // console.log("submitCode: Problem has no hidden test cases.");
            return res.status(400).json({
                success: false,
                message: "This problem has no hidden test cases and cannot be submitted."
            });
        }

        // Debug: Log hidden test cases
        console.log("submitCode: Hidden test cases count:", problem.hiddenTestCases.length);
        problem.hiddenTestCases.forEach((tc, idx) => {
            console.log(`submitCode: Hidden TC ${idx + 1} - Input length: ${tc.input?.length || 0}, Output length: ${tc.output?.length || 0}`);
            if (!tc.output || tc.output.trim() === '') {
                console.warn(`⚠️ submitCode: Hidden test case ${idx + 1} has empty or missing output!`);
            }
        });

        const referenceSolution = problem.referenceSolution.find(rs => rs.language.toLowerCase() === language.toLowerCase());
        const startCode = problem.startCode.find(sc => sc.language.toLowerCase() === language.toLowerCase());

        let finalCode = code;
        if (referenceSolution && startCode) {
            finalCode = referenceSolution.completeCode.replace(startCode.initialCode, code);
        }

        // Don't send expected_output to Judge0 - we'll compare manually
        const submission = problem.hiddenTestCases.map((testcase) => ({
            source_code: finalCode,
            language_id: languageId,
            stdin: testcase.input,
            // expected_output: testcase.output, // Removed - manual comparison
        }));
        console.log("submitCode: Prepared submission batch");

        const submitResult = await SubmitBatch(submission);
        if (!submitResult || !Array.isArray(submitResult)) {
            console.log("submitCode: Judge0 submission failed or no result returned");
            return res.status(500).send("Judge0 submission failed or no result returned.");
        }
        console.log("submitCode: Judge0 submission successful");

        const resultToken = submitResult.map((value) => value.token);
        const testResult = await submitToken(resultToken);
        console.log("submitCode: Received test results");

        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let errorMessage = null;
        let status = "Accepted";

        // Debug: Log test results
        console.log("submitCode: Total test cases:", testResult.length);

        for (let i = 0; i < testResult.length; i++) {
            const test = testResult[i];
            const statusId = test.status?.id || test.status_id;
            const expectedOutput = problem.hiddenTestCases[i]?.output;
            const actualOutput = test.stdout;

            // Normalize outputs for comparison (trim whitespace)
            const normalizedExpected = expectedOutput?.trim() || '';
            const normalizedActual = actualOutput?.trim() || '';

            // Debug logging for each test case
            console.log(`submitCode: Test case ${i + 1}:`, {
                statusId,
                statusDescription: test.status?.description,
                actualOutput: actualOutput?.substring(0, 100),
                expectedOutput: expectedOutput?.substring(0, 100),
                normalizedMatch: normalizedExpected === normalizedActual,
                stderr: test.stderr?.substring(0, 100)
            });

            // First check if code executed successfully (status 3 = Accepted execution)
            if (statusId == 3) {
                // Code executed, now check if output matches
                if (normalizedExpected === normalizedActual) {
                    testCasesPassed++;
                    runtime = runtime + parseFloat(test.time || 0);
                    memory = Math.max(memory, parseInt(test.memory || 0));
                } else {
                    // Output doesn't match
                    status = "Wrong Answer";
                    errorMessage = `Expected: ${normalizedExpected.substring(0, 50)}, Got: ${normalizedActual.substring(0, 50)}`;
                    console.log(`submitCode: Wrong Answer - Expected: "${normalizedExpected}", Got: "${normalizedActual}"`);
                    break;
                }
            } else {
                // Code didn't execute successfully - determine the error type
                if (statusId == 4) {
                    status = "Wrong Answer";
                    errorMessage = test.stderr || test.compile_output || "Wrong Answer";
                } else if (statusId == 6) {
                    status = "Compilation Error";
                    errorMessage = test.compile_output || test.stderr || "Compilation Error";
                } else if (statusId == 5) {
                    status = "Time Limit Exceeded";
                    errorMessage = "Time Limit Exceeded";
                } else if (statusId == 7 || statusId == 8 || statusId == 9 || statusId == 10 || statusId == 11 || statusId == 12) {
                    status = "Runtime Error";
                    errorMessage = test.stderr || test.message || "Runtime Error";
                } else {
                    status = test.status?.description || "Error";
                    errorMessage = test.stderr || test.compile_output || test.message || "Unknown Error";
                }
                break; // Stop at first failure
            }
        }
        console.log("submitCode: Test results processed - Status:", status, "Passed:", testCasesPassed, "/", testResult.length);

        // update to the database submission store into the database which previous stored as pending if it's wrong answer that will also be stored 
        submittedResult.status = status;
        submittedResult.runtime = runtime;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.memory = memory;
        submittedResult.errorMessage = errorMessage;

        await submittedResult.save();
        // console.log("submitCode: Submission updated with results");

        // // after submission saving it to the problem Id - only if status is Accepted
        // console.log("submitCode: Checking if problem is already solved. Status:", status);
        // console.log("submitCode: User's problemSolved array:", req.result.problemSolved);
        // console.log("submitCode: Problem ID to check:", problemId);

        if (status === 'Accepted') {
            try {
                const updatedUser = await User.findByIdAndUpdate(
                    userId,
                    { $addToSet: { problemSolved: problemId } },
                    { new: true }
                );
                if (updatedUser) {
                    console.log("submitCode: User problemSolved array updated successfully.");
                    const io = getIO();
                    if (io) {
                        io.to(userId.toString()).emit('userStatsUpdate', { userId });
                        console.log(`submitCode: Emitted userStatsUpdate event to user ${userId}.`);
                    }
                } else {
                    console.log("submitCode: User not found for update.");
                }
            } catch (userUpdateError) {
                console.error("submitCode: Error updating user's solved problems:", userUpdateError);
                // Decide if this should be a critical error. For now, we'll just log it
                // and allow the submission to be considered successful.
            }
        }

        const accepted = (status == 'Accepted');
        res.status(201).json({
            success: true,
            message: accepted ? "Submission accepted" : "Submission processed",
            accepted,
            totalTestCases: submittedResult.totalTestCases,
            passedTestCases: testCasesPassed,
            runtime,
            memory
        });
        console.log("submitCode: Response sent");

    } catch (err) {
        console.error("Error in submitCode:", err);
        try {
            res.status(500).send("Internal Server Error " + err.message || err);
        } catch (sendErr) {
            console.error("Error sending error response:", sendErr);
        }
    }
}


const runCode = async (req, res) => {

    const userId = req.result._id;
    console.log(userId)

    const { id } = req.params;
    const problemId = id;

    let { code, language } = req.body;
    if (language === 'cpp')
        language = 'c++'

    if (!userId || !problemId || !code || !language)
        return res.status(401).send("Fields Are Missing");

    //fetch the problem from database
    const problem = await Problem.findById(problemId);

    //now judge0 code submit 
    const languageId = await getLanguageById(language);

    if (!languageId)
        return res.status(404).send(" Invalid Language Id");

    const referenceSolution = problem.referenceSolution.find(rs => rs.language.toLowerCase() === language.toLowerCase());
    const startCode = problem.startCode.find(sc => sc.language.toLowerCase() === language.toLowerCase());

    let finalCode = code;
    if (referenceSolution && startCode) {
        finalCode = referenceSolution.completeCode.replace(startCode.initialCode, code);
    }

    // Don't send expected_output to Judge0 - we'll compare manually
    const submission = problem.visibleTestCases.map((testcase) => ({
        source_code: finalCode,
        language_id: languageId,
        stdin: testcase.input,
        // expected_output: testcase.output, // Removed - manual comparison
    }));

    const submitResult = await SubmitBatch(submission);

    if (!submitResult || !Array.isArray(submitResult)) {
        return res.status(500).send("Judge0 submission failed or no result returned.");
    }


    const resultToken = submitResult.map((value) => value.token);

    const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = true;
    let errorMessage = null;

    for (let i = 0; i < testResult.length; i++) {
        const test = testResult[i];
        const statusId = test.status?.id || test.status_id;
        const expectedOutput = problem.visibleTestCases[i]?.output;
        const actualOutput = test.stdout;

        // Normalize outputs for comparison (trim whitespace)
        const normalizedExpected = expectedOutput?.trim() || '';
        const normalizedActual = actualOutput?.trim() || '';

        if (statusId == 3) {
            // Code executed successfully, now check output
            if (normalizedExpected === normalizedActual) {
                testCasesPassed++;
                runtime = runtime + parseFloat(test.time || 0);
                memory = Math.max(memory, parseInt(test.memory || 0));
            } else {
                status = false;
                errorMessage = `Test case ${i + 1} failed: Expected "${normalizedExpected}", Got "${normalizedActual}"`;
            }
        } else {
            status = false;
            if (statusId == 4) {
                errorMessage = test.stderr || test.compile_output || "Wrong Answer";
            } else if (statusId == 6) {
                errorMessage = test.compile_output || test.stderr || "Compilation Error";
            } else if (statusId == 5) {
                errorMessage = "Time Limit Exceeded";
            } else {
                errorMessage = test.stderr || test.compile_output || test.message || "Runtime Error";
            }
        }
    }

    res.status(201).json({
        success: status,
        testCases: testResult,
        runtime,
        memory,
        errorMessage
    });
}




module.exports = { submitCode, runCode }
