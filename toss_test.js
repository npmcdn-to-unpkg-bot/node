
var platformEvent = require("events");
var platformFile = require("fs");

require("./load").load("state_test", function() { return this; });









//   _____                               _   __  __ _     _        _        
//  |_   _|__  ___ ___    __ _ _ __   __| | |  \/  (_)___| |_ __ _| | _____ 
//    | |/ _ \/ __/ __|  / _` | '_ \ / _` | | |\/| | / __| __/ _` | |/ / _ \
//    | | (_) \__ \__ \ | (_| | | | | (_| | | |  | | \__ \ || (_| |   <  __/
//    |_|\___/|___/___/  \__,_|_| |_|\__,_| |_|  |_|_|___/\__\__,_|_|\_\___|
//                                                                          






//demos of basic use

//run code that throws an exception
if (demo("throw")) { demoThrow(); }
function demoThrow() {

	Data("hello").start(6);//throws chop
}

//catch an exception and sand it to mistakeLog(e)
if (demo("mistake-log")) { demoMistakeLog(); }
function demoMistakeLog() {

	try {
		Data("hello").start(6);
	} catch (e) { mistakeLog(e); }

	log("code after runs");
}

//catch an exception and sand it to mistakeStop(e)
if (demo("mistake-stop")) { demoMistakeStop(); }
function demoMistakeStop() {

	try {
		Data("hello").start(6);
	} catch (e) { mistakeStop(e); }

	log("code after does not run");
}

//code in a timeout function that throws an exception
//confirms that an uncaught exception in a timeout function ends the node process, even if there are more events that might work later
if (demo("timeout-throw")) { demoTimeoutThrow(); }
function demoTimeoutThrow() {
	log("setting timeouts for 2 and 4 seconds from now");

	setTimeout(function() {//in 4 seconds, this function will run successfully

		log("ran after 4 seconds");//never runs, the uncaught exception at 2 seconds ends the node process

	}, 4000);

	setTimeout(function() {//in 2 seconds, this function will run and throw

		log("ran after 2 seconds");
		Data("hello").start(6);//throws chop

	}, 2000);
}





//test of basic use

exports.testToss = function(test) {

	try {
		toss();//blank ok
		test.fail();//this line doesn't run
	} catch (e) {}

	try {
		toss("custom");
		test.fail();
	} catch (e) { test.ok(e.name == "custom"); }//the name we expect

	done(test);
}








//demos of real exceptions with details

if (demo("path-1")) { demoPath1(); }
function demoPath1() {
	try {

		pathCheck(Path("C:\\name"), Path("C:\\name2"));

	} catch (e) { log(e); }
}

if (demo("path-2")) { demoPath2(); }
function demoPath2() {

	try { a(); } catch (e) { log(e); }
	function a() { b(); }
	function b() { c(); }
	function c() { Path("file.ext"); }
}










//demos and tests that catch or receive example exceptions

if (demo("mistake-1")) { catchMistake(mistake1); }
if (demo("mistake-2")) { catchMistake(mistake2); }
if (demo("mistake-3")) { catchMistake(mistake3); }
if (demo("mistake-4")) { catchMistake(mistake4); }
if (demo("mistake-5")) { getMistake(mistake5); }
if (demo("mistake-6")) { getMistake(mistake6); }
if (demo("mistake-7")) { getMistake(mistake7); }
if (demo("mistake-8")) { catchMistake(mistake8); }
function catchMistake(f) {//synchronous behavior
	try {
		f();//call the given function f
	} catch (e) { mistakeStop(e); }//and catch the exception e that it throws
}
function getMistake(f) {//asynchronous behavior
	f(function (e) { mistakeStop(e); });//call the given function f, giving it a function that will receive the exception e later
}

//1. throw a simple mistake
/*
data
catchMistake() mistake1() toss_test.js:164

*/
function mistake1() {
	toss("data");
}
exports.testMistake1 = function(test) {
	try {
		mistake1();
		test.fail();
	} catch (e) {

		test.ok(isType(e, "Mistake"));//look at e
		test.ok(e.name == "data");

		var s = say(e);//check text form
		test.ok(s.starts("data"));
		test.ok(s.has("mistake1()"));

		done(test);
	}
}

//2. throw a detailed mistake, with all the bells and whistles
/*
data
catchMistake() mistake2() toss_test.js:172
note about what happened
a: apple
b: banana
c: carrot
d: Text in a Data object

*/
function mistake2() {
	var a = "apple";
	var b = "banana";
	var c = "carrot";
	var d = Data("Text in a Data object");
	toss("data", {note:"note about what happened", watch:{a:a, b:b, c:c, d:d}});
}
exports.testMistake2 = function(test) {
	try {
		mistake2();
		test.fail();
	} catch (e) {

		test.ok(isType(e, "Mistake"));//look at e
		test.ok(e.name == "data");
		test.ok(e.note == "note about what happened");

		var s = say(e);//check text form
		test.ok(s.starts("data"));
		test.ok(s.has("mistake2()"));
		test.ok(s.has("a: apple"));
		test.ok(s.has("d: Text in a Data object"));

		done(test);
	}
}

//3. throw a deep mistake, with a long call stack of program functions
/*
data
catchMistake() mistake3() a() b() c() toss_test.js:178

*/
function mistake3() {
	function a() { b(); }
	function b() { c(); }
	function c() { toss("data"); }
	a();
}
exports.testMistake3 = function(test) {
	try {
		mistake3();
		test.fail();
	} catch (e) {

		test.ok(isType(e, "Mistake"));//look at e
		test.ok(e.name == "data");

		var s = say(e);//check text form
		test.ok(s.starts("data"));
		test.ok(s.has("mistake3() a() b() c()"));

		done(test);
	}
}

//4. throw a nested mistake, with a caught mistake inside
/*
data
catchMistake() mistake4() toss_test.js:185

caught chop
catchMistake() mistake4() start() _clip() data.js:125

*/
function mistake4() {
	try {
		Data("hello").start(6);//throws chop
	} catch (e) { toss("data", {caught:e}); }//catch chop, wrap it in a data exception, and throw that
}
exports.testMistake4 = function(test) {
	try {
		mistake4();
		test.fail();
	} catch (e) {

		test.ok(isType(e, "Mistake"));//look at e
		test.ok(e.name == "data");

		test.ok(e.caught.name == "chop");//look at e.caught
		test.ok(isType(e.caught, "Mistake"));

		var s = say(e);//check text form
		test.ok(s.starts("data"));
		test.ok(s.has("caught chop"));
		test.ok(s.has("mistake4() start() _clip()"));

		done(test);
	}
}

//5. pass to f(e) a platform error, no program mistake at all, nothing thrown or caught
/*
{ [Error: ENOENT, open 'c:\node\notfound.ext']
  errno: 34,
  code: 'ENOENT',
  path: 'c:\\node\\notfound.ext' }
*/
function mistake5(f) {
	platformFile.open("notfound.ext", "r", function(error, file) {
		if (error) f(error);
	});
}
exports.testMistake5 = function(test) {
	mistake5(function (e) {

		test.ok(isType(e, "Error"));//look at e
		test.ok(e.errno == 34);
		test.ok(e.code == "ENOENT");
		test.ok(e.path.ends("notfound.ext"));

		var s = say(e);//check text form
		test.ok(s.has("[Error: ENOENT, open '"));
		test.ok(s.has("errno: 34,"));
		test.ok(s.has("code: 'ENOENT',"));

		done(test);//mark the text done in the callback to make sure it gets called
	});
}

//6. pass to f(e) a platform error enclosed in a tossed and then caught mistake
/*
data
toss_test.js:198

caught { [Error: ENOENT, open 'c:\node\notfound.ext']
  errno: 34,
  code: 'ENOENT',
  path: 'c:\\node\\notfound.ext' }
*/
function mistake6(f) {
	platformFile.open("notfound.ext", "r", function(error, file) {
		if (error) {
			try {
				toss("data", {caught:error});
			} catch (e) { f(e); }
		}
	});
}
exports.testMistake6 = function(test) {
	mistake6(function (e) {

		test.ok(isType(e, "Mistake"));//look at e
		test.ok(e.name == "data");

		test.ok(isType(e.caught, "Error"));//look at the caught and contained error
		test.ok(e.caught.errno == 34);
		test.ok(e.caught.code == "ENOENT");
		test.ok(e.caught.path.ends("notfound.ext"));

		var s = say(e);//check text form
		test.ok(s.starts("data"));
		test.ok(s.has("caught { [Error: ENOENT, open '"));
		test.ok(s.has("errno: 34,"));
		test.ok(s.has("code: 'ENOENT',"));

		done(test);
	});
}

//7. a combination of everything fancy
/*
program
next() a() b() c() d() e() f() toss_test.js:228
settings not available

caught disk
next() a() b() c() toss_test.js:219
couldnt open file
name: notfound.ext
access: r

caught { [Error: ENOENT, open 'c:\node\notfound.ext']
  errno: 34,
  code: 'ENOENT',
  path: 'c:\\node\\notfound.ext' }
*/
function mistake7(done) {

	var name   = "notfound.ext";
	var access = "r";
	platformFile.open(name, access, next);//try to open a file that doesn't exist

	function next(e1, file) {//in a new event, the platform gives us e1 here
		if (e1) a(e1);
	}

	function a(e1) { b(e1); }//build up a call stack
	function b(e1) { c(e1); }
	function c(e1) {
		try {

			toss("disk", {note:"couldnt open file", watch:{name:name, access:access}, caught:e1});//wrap and toss

		} catch (e2) {//catch
			try {

				d(e2);
				function d(e2) { e(e2); }
				function e(e2) { f(e2); }
				function f(e2) {
					toss("program", {note:"settings not available", caught:e2});//wrap and toss again
				}

			} catch (e3) { done(e3); }//catch and pass out
		}
	}
}
exports.testMistake7 = function(test) {
	mistake7(function (e) {

		test.ok(isType(e, "Mistake"));//look at e
		test.ok(e.name == "program");
		test.ok(e.note == "settings not available");

		test.ok(isType(e.caught, "Mistake"));//caught and kept inside
		test.ok(e.caught.name == "disk");
		test.ok(e.caught.note == "couldnt open file");
		test.ok(e.caught.watch.name == "notfound.ext");
		test.ok(e.caught.watch.access == "r");

		test.ok(isType(e.caught.caught, "Error"));//inside again
		test.ok(e.caught.caught.errno == 34);
		test.ok(e.caught.caught.code == "ENOENT");
		test.ok(e.caught.caught.path.ends("notfound.ext"));

		var s = say(e);//check text form
		test.ok(s.starts("program"));
		test.ok(s.has("a() b() c() d() e() f()"));
		test.ok(s.has("settings not available"));

		test.ok(s.has("caught disk"));
		test.ok(s.has("couldnt open file"));
		test.ok(s.has("name: notfound.ext"));

		test.ok(s.has("caught { [Error: ENOENT, open '"));
		test.ok(s.has("errno: 34,"));
		test.ok(s.has("code: 'ENOENT',"));

		done(test);
	});
}

//8. a completely blank toss
/*
exception
catchMistake() mistake8() toss_test.js:237

*/
function mistake8() {
	toss();//not even a name
}
exports.testMistake8 = function(test) {
	try {
		mistake8();
		test.fail();
	} catch (e) {

		test.ok(isType(e, "Mistake"));//look at e
		test.ok(!e.name);//no name, not even a blank name

		var s = say(e);//check text form
		test.ok(s.starts("exception"));//say labels it an exception when there is no name
		test.ok(s.has("mistake8()"));

		done(test);
	}
}




































//have mistakeLog(name, e), which calls Mistake, and then logs it, change every call to mistakeLog to not make up the fake object inline
//no, because then you can't log an already caught exception
//so this is ok, and also a lot easier, and matches mistakeStop
//mistakeLog(e)
//mistakeLog(Mistake())



//look at combining or rebalancing between text:toss and state:mistake
//text has toss, state has mistake, all the tests are here, move them to state_test.js when done

//rename path's underscore functions to not have underscores, you're overusing underscore unnecessarily
//in path, test C:file.ext, the path style before dos had folders

//later, the one line summary would be a cool part of an asynchronous call stack
//test in node webkit, the our code means a path in pwd trick might not work
















