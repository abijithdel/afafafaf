var express = require('express');
var router = express.Router();
var Category = require('../helperDB/category');
var Video = require('../helperDB/video');
/* GET home page. */
function role(req,res,nest){
  var role = req.session.userSession.role
  if (role === 'admin'){
    var admin =true
    nest()
  }else{
    admin =false
    res.redirect('/')
  }
}
router.get('/', async function(req, res, next) {
  const newCategory = await Category.find()
  const data = await Video.find()
  res.render('category/all-category', { data,newCategory,user:req.session.userSession });
});


router.get('/specific-category/:name',async(req,res)=>{
  let {name} = req.params
  const newCategory = await Category.find()
  const videos = await Video.find({ category: new RegExp(name, 'i') });
  res.render('category/specific-category',{newCategory, videos, name, user:req.session.userSession})
})


module.exports = router;
