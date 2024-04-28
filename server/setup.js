let fs = require ("fs");
let mongoose = require ("mongoose");
let Question = require ("./schema/questions.js").model;

let config = JSON.parse (fs.readFileSync ("./config.json"));
let questions = JSON.parse (fs.readFileSync ("./questions.json"));
console.log(questions);

console.log ("--  Quizzer database installer  --\n");
console.log ("This script will install the questions from questions.json\ninto your database, using to the following configuration\nfrom config.json:\n");
console.log ("  host:       " + config.dbHost);
console.log ("  database:   " + config.dbName + "\n");
console.log ("Press to continue or Ctrl+C to cancel");

let loop = (round, maxRounds, prevPercent) => {
	if (round < maxRounds) {
		let percentage = parseInt (100 / maxRounds * round, 10);
        console.log(percentage);
		if (percentage === 0 || percentage === 25 || percentage === 50 || percentage === 75) {
			if (percentage !== prevPercent) {
				process.stdout.write (" "+percentage+"%...");
			}
		}
		let result = questions [round];
		result._id = new mongoose.Types.ObjectId ();
        let question = new Question (result);
        question.save()
            .then(function (round, maxRounds, percentage) {
                loop (round+1, maxRounds, percentage);
            })
            .catch(function (err) {
                console.log (err.toString ());
                process.exit ();
            });
    } else {
		console.log (` 100% done!`);
		console.log ("\nImported " + maxRounds + " questions");
		process.exit ();
	}
};
    

process.stdin.on ('data', () => {
    mongoose.Promise = global.Promise;

    uri = `mongodb+srv://${config.dbHost}`;
    options = {
        "user": config.username,
        "pass": config.passwd,
        "dbName": config.dbName,
    }
    mongoose.connect (uri, options)
        .then(function (questions) {
            process.stdout.write (`Importing questions...`);
            // https://stackoverflow.com/questions/6756104/get-size-of-json-object
            loop (0, Object.keys(questions).length, 0);
        })
        .catch(function (err) {
            console.log ("Error: " + err);
            process.exit ();
        });
});
