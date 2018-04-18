/*importing middleware*/
var express = require("express");
const fs = require("fs");
var app = express();

/*parsing leads.json file*/
var raw_data = fs.readFileSync('leads.json');
var original_data = JSON.parse(raw_data);

/*variables*/
var unique = {}; //tracks unique emails and _ids
var entries = {}; //maps unique id to json record
var output_stream = fs.createWriteStream('logs.txt');//streams changes in entries dictionary to logs.txt file

for(var i = 0; i < original_data.leads.length; i++){
    if( ! (original_data.leads[i]['_id'] in unique) && ! (original_data.leads[i]['email'] in unique)){
        /*only add id:email and email:id to unique dictionary if both haven't been seen before*/
        unique[original_data.leads[i]['_id']] = original_data.leads[i]['email'];
        unique[original_data.leads[i]['email']] = original_data.leads[i]['_id'];
        /*then id is the key for the actual json entry*/
        entries[original_data.leads[i]['_id']] = original_data.leads[i];
         
    }else if( original_data.leads[i]['_id'] in unique){
        /*if id exists in unique, then we have to delete the old email from unique and update our
        id with a new email*/
        var key = unique[original_data.leads[i]['_id']];
        delete unique[ key];
        unique[original_data.leads[i]['_id']] = original_data.leads[i]['email'];
        unique[original_data.leads[i]['email']] = original_data.leads[i]['_id'];
        
        /*we then update our entires*/
        var old_record = entries[original_data.leads[i]['_id']];
        entries[original_data.leads[i]['_id']] = original_data.leads[i];
        var new_record = entries[original_data.leads[i]['_id']];
        
        /*this chunk is responsible for outputting the modified logs*/
        var text = "\n\nChanges made for ID: "+original_data.leads[i]['_id']+
        "\n from: "+JSON.stringify(old_record)+"\n to: "
        +JSON.stringify(new_record)+"\n\n";
        output_stream.write(text);

        for(var key in old_record){
            if(old_record[key] != new_record[key]){
                var changes = "Modified " + key + " from " + old_record[key] 
                + " to "+ new_record[key]+"\n";  
                output_stream.write(changes);
                output_stream.end();
            } 
        }
        
    }else if( original_data.leads[i]['email'] in unique){
        /*if email exists in unique, then we have to add a new id and remove the old id*/
        var key = unique[original_data.leads[i]['email']];
        delete unique[key];
        unique[original_data.leads[i]['_id']] = original_data.leads[i]['email'];
        unique[original_data.leads[i]['email']] = original_data.leads[i]['_id']; 
        /*updating entries variable*/
        var old_record = entries[key];
        delete entries[key];
        entries[original_data.leads[i]['_id']] = original_data.leads[i];
        var new_record = entries[original_data.leads[i]['_id']];

        /*this chunk is responsible for outputting the modified logs*/
        var text = "\n\nChanges made for ID: "+original_data.leads[i]['_id']+
        "\n from: "+JSON.stringify(old_record)+"\n to: "
        +JSON.stringify(new_record)+"\n\n";
        output_stream.write(text);
        
        for(var key in old_record){
            if(old_record[key] != new_record[key]){
                var changes = "Modified " + key + " from " + old_record[key] 
                + " to "+ new_record[key]+"\n";  
                output_stream.write(changes);
                output_stream.end();
        }
    }
}