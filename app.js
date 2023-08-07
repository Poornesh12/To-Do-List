const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine",'ejs');
var items = [];
var Workitems = [];

mongoose.connect("mongodb://localhost:27017/TaskDB");

const Taskschema = new mongoose.Schema({
  taskname : String,
});

const Item = new mongoose.model("Item", Taskschema);




const listschema = new mongoose.Schema({
  name : String,
  list : [Taskschema]
});

const List = new mongoose.model("List", listschema);



app.get("/",function(req,res){
   var day = "Today";
   Item.find({})
   .then(items=>{
     res.render("list.ejs",{listtitle:day,items:items});
   });

});


app.get("/:customListName",function(req,res){

  const customListName =_.capitalize( req.params.customListName );
  List.findOne({name : customListName})
   .then(result => {
     if(!result){
       const newlist = new List({
         name : customListName,


       });
       newlist.save();
       res.redirect("/"+customListName);
     }

    else res.render("list.ejs",{listtitle:result.name, items:result.list });
  });


});



app.post("/",function(req,res){

  var item = new Item({
    taskname: req.body.newitem
  });
  const listname = req.body.listname;
  if(listname === "Today"){
  item.save();
  res.redirect("/");}
else{  List.findOne({name : listname})
      .then(result=>{
        result.list.push(item);
        result.save();
        res.redirect("/"+listname);
      });
}
});


app.post("/delete",function(req,res){
 const id = req.body.checkbox;
 const listname = req.body.listname;
 if(listname === "Today"){
 Item.findByIdAndRemove(id)
 .then(result=>{res.redirect("/");});
}
else{
  List.findOneAndUpdate({name:listname},{$pull :{list:{_id:id}}})
         .then(result => {res.redirect("/"+listname);});
}

});



app.listen(3000,function(req,res){
  console.log("Server startes at port:3000");
});
