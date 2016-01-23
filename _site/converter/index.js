#!/usr/bin/env node

var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({explicitArray : false, trim: true, explicitChildren: true});
var builder = new xml2js.Builder({ headless: true});

var inputDir = '/Users/John/Documents/code/yeltzland.git/news/data/';
var outputDir = '/Users/John/Documents/code/yeltzland-static/_posts/';

fs.readdir(inputDir, function(err, files) {
    files.forEach(function(inputFileName) {
        var fullInputPath = inputDir + inputFileName;
        
        fs.readFile(fullInputPath, function(err, data) {
            
            // First replace the b/a tags
            data = data.toString().replace(/<b>/g, '*b*');
            data = data.replace(/<\/b>/g, '*cb*');
            data = data.replace(/<a href="(.*)">/g, '*a[$1]*');
            data = data.replace(/<\/a>/g, '*ca*');
          
            parser.parseString(data, function (err, result) {
                if (result) {
                    if (result.NEWS.$$.DATE == undefined || result.NEWS.$$.DATE.length == 0 || result.NEWS.$$.BODY == undefined) {
                        return;
                    }

                    var title = result.NEWS.$$.TITLE;
                    var articleDate = result.NEWS.$$.DATE;
                    var body = result.NEWS.$$.BODY;
                    var match = result.NEWS.$$.MATCH;
                    
                    if (title.length <= 4) {
                        title = 'News Story';
                    }
                    
                    title = title.replace(/:/g, ' ');
                    match = match.replace(/\r\n/g, ' ');
                    match = match.replace(/:/g, ' ');
                    
                    var output = '---' + '\n';
                    output += 'layout: newsstory\n';
                    output += 'title: ' + title + '\n';
                    output += 'match: ' + match + '\n';
                    //output += 'permalink: /news/' + articleDate + '/:title.html' + '\n';
                    output += '---' + '\n\n';
 
                    var xml = builder.buildObject(body.$$);
                    xml = xml.replace(/<\$\$>(.|\n)*<\/\$\$>/g, '');
                    for (var i = 0; i < 10; i++) {
                        var re = new RegExp('<' + i, 'g');
                        xml = xml.replace(re, '<p');
                        
                        var re2 = new RegExp('</' + i + '>', 'g');
                        xml = xml.replace(re2, '</p>');
                        
                        var re3 = new RegExp('<' + i + '/>', 'g');
                        xml = xml.replace(re3, '');
                    }
                    
                    xml = xml.replace(/\*b\*/g, ' <b>');
                    xml = xml.replace(/\*cb\*/g, '<\/b> ');
                    xml = xml.replace(/\*a\[(.*)\]\*/g, ' <a href="$1">');
                    xml = xml.replace(/\*ca\*/g, '<\/a> ');
                  
                    output += xml + '\n';   
                    
                    if (result.NEWS.$$.MATCHREPORT != undefined) {
                        var report = result.NEWS.$$.MATCHREPORT;
                        
                        if (report.$$ != undefined && report.$$.REPORTER != undefined) {
                            output += '<h3>Match Report from ' + report.$$.REPORTER.toString() + '</h3>\n';
                            
                            var bodyXml = builder.buildObject(report.$$.BODY);
                            bodyXml = bodyXml.replace(/<\$\$>/g, '');
                            bodyXml = bodyXml.replace(/<\/\$\$>/g, '');
                            
                            output += bodyXml + '\n';   
                        }
                    }                                                                            
               
                    var outputPath = outputDir + articleDate + '-' + title + '.html';
                    fs.writeFile(outputPath, output);           

                    console.log(output);
                }
            });           
        });
    }, this);
});
