const http = require("http");
const fs = require("fs");
const readline = require('readline');

let fileCount = 0;

const convertFile = (res, file, fileLength) => {
	let data = "";
	let countLine = 1;

	let rd = readline.createInterface({
    input: fs.createReadStream(`./subtitles/${file}`),
	});

	rd.on("line", (line) => {
		if(line.indexOf("WEBVTT") != -1) return ;

		if(line.indexOf("-->") != -1) {
			let timesArr = line.split("-->");
			let timeStart = timesArr[0].split(":").map(item => item.trim().replace(/\./g, ","));
			let timeEnd = timesArr[1].split(":").map(item => item.trim().replace(/\./g, ","));

			for(let i=timeStart.length; i<3; i++) timeStart.unshift("00");
			for(let i=timeEnd.length; i<3; i++) timeEnd.unshift("00");

			data += `${countLine++}\n${timeStart.join(":")} --> ${timeEnd.join(":")}\n`;
		} else {
			data += line + "\n";
		}
	});

	rd.on("close", () => {
		let writerStream = fs.createWriteStream(`./output/${file}.srt`);

		writerStream.write(data.trim(),'UTF8');
		writerStream.end();

		writerStream.on('finish', function() {
			res.write(`\n********** ${fileCount}: ${file} **********\n`)
	    res.write(data.trim())
	    res.write("\n\n\n\n");

	    if(++fileCount == fileLength) res.end();
		});
	});

	rd.on("error", error => res.end(error.stack));
}

http.createServer((req, res) => {
	fs.readdir("./subtitles/", (error, files) => {
		if(error) res.end(error.stack);
		else {
			files.forEach((file, fileIndex) => {
				convertFile(res, file, files.length)
			});
		}
	})
}).listen(9999)

console.log("Server start at port: 9999");