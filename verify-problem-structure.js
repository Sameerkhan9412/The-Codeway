/**
 * Problem Structure Validator
 * 
 * This script validates that your problem structure is correct before creating it.
 * 
 * Usage:
 * node verify-problem-structure.js <problem-json-file>
 */

const fs = require('fs');

function validateProblem(problem) {
    const errors = [];
    const warnings = [];

    // 1. Check required fields
    if (!problem.title) errors.push("❌ Missing 'title'");
    if (!problem.description) errors.push("❌ Missing 'description'");
    if (!problem.difficulty) errors.push("❌ Missing 'difficulty'");
    if (!problem.tags || problem.tags.length === 0) errors.push("❌ Missing 'tags'");
    
    // 2. Check test cases
    if (!problem.visibleTestCases || problem.visibleTestCases.length === 0) {
        errors.push("❌ Missing 'visibleTestCases'");
    } else {
        problem.visibleTestCases.forEach((tc, idx) => {
            if (!tc.input) errors.push(`❌ Visible test case ${idx + 1}: Missing 'input'`);
            if (!tc.output) errors.push(`❌ Visible test case ${idx + 1}: Missing 'output'`);
            if (!tc.explanation) warnings.push(`⚠️ Visible test case ${idx + 1}: Missing 'explanation'`);
            
            // Check for trailing whitespace
            if (tc.output && tc.output !== tc.output.trim()) {
                warnings.push(`⚠️ Visible test case ${idx + 1}: Output has trailing whitespace`);
            }
        });
    }

    if (!problem.hiddenTestCases || problem.hiddenTestCases.length === 0) {
        warnings.push("⚠️ No 'hiddenTestCases' - submissions will only be tested against visible cases");
    } else {
        problem.hiddenTestCases.forEach((tc, idx) => {
            if (!tc.input) errors.push(`❌ Hidden test case ${idx + 1}: Missing 'input'`);
            if (!tc.output) errors.push(`❌ Hidden test case ${idx + 1}: Missing 'output'`);
            
            // Check for trailing whitespace
            if (tc.output && tc.output !== tc.output.trim()) {
                warnings.push(`⚠️ Hidden test case ${idx + 1}: Output has trailing whitespace`);
            }
        });
    }

    // 3. Check startCode
    if (!problem.startCode || problem.startCode.length === 0) {
        errors.push("❌ Missing 'startCode'");
    } else {
        problem.startCode.forEach((sc, idx) => {
            if (!sc.language) errors.push(`❌ Start code ${idx + 1}: Missing 'language'`);
            if (!sc.initialCode) errors.push(`❌ Start code ${idx + 1}: Missing 'initialCode'`);
        });
    }

    // 4. Check referenceSolution
    if (!problem.referenceSolution || problem.referenceSolution.length === 0) {
        errors.push("❌ Missing 'referenceSolution'");
    } else {
        problem.referenceSolution.forEach((rs, idx) => {
            if (!rs.language) errors.push(`❌ Reference solution ${idx + 1}: Missing 'language'`);
            if (!rs.completeCode) errors.push(`❌ Reference solution ${idx + 1}: Missing 'completeCode'`);
        });
    }

    // 5. CRITICAL: Check if startCode.initialCode is present in referenceSolution.completeCode
    if (problem.startCode && problem.referenceSolution) {
        problem.startCode.forEach((sc) => {
            const matchingRef = problem.referenceSolution.find(rs => rs.language === sc.language);
            if (matchingRef) {
                if (!matchingRef.completeCode.includes(sc.initialCode)) {
                    errors.push(`❌ CRITICAL: startCode.initialCode for '${sc.language}' is NOT present in referenceSolution.completeCode`);
                    errors.push(`   This will cause code replacement to fail!`);
                } else {
                    console.log(`✅ startCode for '${sc.language}' is correctly embedded in referenceSolution`);
                }
            } else {
                warnings.push(`⚠️ No reference solution found for language '${sc.language}'`);
            }
        });
    }

    // 6. Check if reference solutions have main function
    if (problem.referenceSolution) {
        problem.referenceSolution.forEach((rs) => {
            const hasMain = rs.completeCode.includes('main') || 
                           rs.completeCode.includes('if __name__') ||
                           rs.completeCode.includes('readline');
            if (!hasMain) {
                warnings.push(`⚠️ Reference solution for '${rs.language}' might be missing input/output handling (main function)`);
            }
        });
    }

    return { errors, warnings };
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node verify-problem-structure.js <problem-json-file>');
        console.log('Example: node verify-problem-structure.js sample-problems.json');
        process.exit(1);
    }

    const filename = args[0];
    
    if (!fs.existsSync(filename)) {
        console.error(`❌ File not found: ${filename}`);
        process.exit(1);
    }

    try {
        const content = fs.readFileSync(filename, 'utf8');
        const data = JSON.parse(content);
        
        // Handle both single problem and array of problems
        const problems = data.problems || [data];
        
        console.log(`\n📋 Validating ${problems.length} problem(s)...\n`);
        
        let totalErrors = 0;
        let totalWarnings = 0;
        
        problems.forEach((problem, idx) => {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`Problem ${idx + 1}: ${problem.title || 'Untitled'}`);
            console.log('='.repeat(60));
            
            const { errors, warnings } = validateProblem(problem);
            
            if (errors.length > 0) {
                console.log('\n🚨 ERRORS:');
                errors.forEach(err => console.log(err));
                totalErrors += errors.length;
            }
            
            if (warnings.length > 0) {
                console.log('\n⚠️  WARNINGS:');
                warnings.forEach(warn => console.log(warn));
                totalWarnings += warnings.length;
            }
            
            if (errors.length === 0 && warnings.length === 0) {
                console.log('\n✅ Problem structure is valid!');
            }
        });
        
        console.log(`\n${'='.repeat(60)}`);
        console.log('SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Problems: ${problems.length}`);
        console.log(`Total Errors: ${totalErrors}`);
        console.log(`Total Warnings: ${totalWarnings}`);
        
        if (totalErrors > 0) {
            console.log('\n❌ Fix all errors before creating the problem!');
            process.exit(1);
        } else if (totalWarnings > 0) {
            console.log('\n⚠️  Consider fixing warnings for better problem quality.');
        } else {
            console.log('\n✅ All problems are valid and ready to create!');
        }
        
    } catch (error) {
        console.error(`❌ Error reading/parsing file: ${error.message}`);
        process.exit(1);
    }
}

main();

