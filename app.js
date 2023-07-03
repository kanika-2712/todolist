const express = require("express");
const mongoose = require("mongoose");
const _ =require("lodash");
const app = express();
 
app.set("view engine", "ejs");
 
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
 
run();
async function run() {
  try {
    mongoose.connect("mongodb+srv://admin-kanika:Hello123@cluster0.jpmdezw.mongodb.net/todolistDB");
 
    const itemsSchema = new mongoose.Schema({
      name: String,
    });
 
    const Item = mongoose.model("Item", itemsSchema);
 
    var item1 = new Item({
      name: "Wake up early",
    });
    var item2 = new Item({
      name: "Brush my teeth",
    });
    var item3 = new Item({
      name: "Learn to code",
    });
 
    var defaultItems = [item1, item2, item3];
    const listSchema={
      name:String,
      items:[itemsSchema]
    }
    const List=mongoose.model("List",listSchema);
 
    app.get("/", async function (req, res) {
      const foundItems = await Item.find({});
 
      if (!(await Item.exists())) {
        await Item.insertMany(defaultItems);
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
    });
    app.get("/:customListName", function (req, res) {
      const customListName = _.capitalize(req.params.customListName);
     
      List.findOne({ name: customListName })
        .then(function (foundList) {
          if (!foundList) {
            const list = new List({
              name: customListName,
              items: defaultItems,
            });
            list.save();
            res.redirect("/" + customListName);
          } else {
            res.render("list", {
              listTitle: foundList.name,
              newListItems: foundList.items,
            });
          }
        })
        .catch(function (err) {
          console.log(err);
        });
    });
 
    app.post("/", function (req, res) {
      const itemName = req.body.newItem;
      const listName=req.body.list;
      const item= new Item({
        name:itemName,
      });
      if (listName === "Today") {
        item.save()
        res.redirect("/")
    } else {
 
          List.findOne({ name: listName }).exec().then(foundList => {
            foundList.items.push(item)
            foundList.save()
            res.redirect("/" + listName)
        }).catch(err => {
            console.log(err);
        });
    }
});
 
      
    app.post("/delete", async function (req, res) {
      const checkedItemId = req.body.checkbox;
      const listName=req.body.listName;
      if(listName==="Today"){
        if(checkedItemId != undefined){
        await Item.findByIdAndRemove(checkedItemId)
        .then(()=>console.log(`Deleted ${checkedItemId} Successfully`))
        .catch((err) => console.log("Deletion Error: " + err));
       
        res.redirect("/");
        
        }}
        else{
          List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function (foundList)
          {
            res.redirect("/" + listName);
          });
      }
    
      
    });
 
    app.get("/work", function (req, res) {
      res.render("list", { listTitle: "Work List", newListItems: workItems });
    });
 
    app.get("/about", function (req, res) {
      res.render("about");
    });
 
    app.listen(3000, function () {
      console.log("Server started on port 3000");
    });
  } catch (e) {
    console.log(e.message);
  }
}