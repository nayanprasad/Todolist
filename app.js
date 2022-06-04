const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todoListDB");
mongoose.connect("mongodb+srv://admin-nayanprasad:Nay5*123@cluster0.xg3i2qy.mongodb.net/todoListDB");



// const itemShema = new mongoose.Schema({
//   name : String
// })
const itemShema = {
  name: String
};

const Item = mongoose.model("Item", itemShema); // collection

const item1 = new Item({
  name: "welcome to todo list"
})
const item2 = new Item({
  name: "hit the + button to add new item "
})
const item3 = new Item({
  name: "<-- hit this to delete item"
})

const dafaultItem = [item1, item2, item3];


// Item.insertMany(dafaultItem, function (err) { 
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("done");
//   }
//  });

const listShema = {
  name : String,
  items : [itemShema]
};

const List = mongoose.model("List", listShema);



app.get("/", function (req, res) {

  const day = date.getDate();
  Item.find({}, function (err, foundItem) {

    // console.log(foundItem);
    // console.log(foundItem);

    if (foundItem.length === 0) {  // inserting to Item if the array is empty so when each time we restart app.js it wont the items again to the database

      Item.insertMany(dafaultItem, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("done inserting");
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: day, newListItems: foundItem });
    }

  })

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;

  const item = new Item({
    name : itemName
  });

  const listTitle = req.body.list;
  const day = date.getDate();

  if(listTitle === day){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name : listTitle}, function (err, foundItem) { 
      foundItem.items.push(item);
      foundItem.save();
      res.redirect("/" + listTitle);
     });
  }

});

app.post("/delete", function(req, res) { 

  const ID = req.body.checkboxItem;
  // console.log(chekckItemID);
  // console.log(typeof(chekckItemID));
  // console.log( mongoose.Types.ObjectId.isValid(chekckItemID));
  // console.log(ID[0]);
  // console.log(ID.length);
  let finalID = "";
  for(var i = 1 ; i < ID.length; i ++){
     finalID = finalID + ID[i];
  }
  // console.log(finalID);
/*
since we getting one additional space before the object id we getting the Object ID as invalid one .
So i create a string without the first charector of 'chekckItemID' and store it in 'finalID' which will be a valid object ID.
*/ 

  const day = date.getDate();
  const listTitle = req.body.listName;

  if(listTitle === day){
    Item.findByIdAndRemove(finalID, function(err){  
      if(!err){
        console.log("deletion done...");
      }
      else{
        console.log(err);
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({ name : listTitle}, { $pull : { items : { _id : finalID}}}, function (err, foundList) { 
      if(err){
        console.log(err);
      }
      else{
        res.redirect("/" + listTitle);
      }
     });
  }

 });



app.get("/:customListName", function (req, res) { 

  // console.log(req.params.customListName);
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name : customListName}, function (err, foundList) { 
    if(err){
      console.log(err);
    }
    else{
      if(!foundList){
        //create a new list
        const list = new List({
          name : customListName,
          items : dafaultItem
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        //show an existind list
        res.render("list", { listTitle: customListName, newListItems : foundList.items });
      }
    }
   })

 
 });


app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started on port 3000");
});
