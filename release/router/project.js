const express = require('express');
const app = express();
var router = express.Router();
var Project = require('../model/project')
var ObjectId = require('mongodb').ObjectID;

// index
router.get('/', function (req, res) {
    Project.find({}, function(err, project){
        if(req.user == undefined){
            res.render('project',{ title: 'Project',  project: project, logged: false })
        }else{
            res.render('project',{ title: 'Project', project: project, logged: true })
        }
    })
});

// new
router.get('/new', function(req, res){
    res.render('new', { title: 'new',  logged: true })
})

// show 
router.get('/:id', (req, res) => {
    Project.findOne({"_id": ObjectId(req.params.id)}, (err, project) => {
      if(err) return res.json(err);
      res.render('read', { project: project, logged: true });
    });
  });
  
// create
router.post('/', function(req,res){
    console.log("post")
    var newProject = new Project({
        title: req.body.title,
        detail: req.body.detail,
        content: req.body.content
    })

    newProject.save(function(err, data){
        if(err) console.log("저장 실패");
        else{
            console.log(data);
        }
    })
    res.redirect('project')
})


// update
router.post('/:id', (req, res) => {
    const updated = Project.findOne({"_id": ObjectId(req.params.id)})
    updated.update(
    { $set: { "title": req.body.title, "detail": req.body.detail, "content": req.body.content} }, 
    (err, project) => {
        if(err) return res.json(err);
        console.log('update failed');
        console.log(err);
        res.redirect('/');
    });
});

// destroy
router.delete('/:id', (req, res)=>{
    
})

module.exports = router;