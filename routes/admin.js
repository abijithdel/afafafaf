var express = require('express');
var router = express.Router();
const { upload, uploadImg } = require('../config/multerConfig');
const Video = require('../helperDB/video');
const User = require('../helperDB/user');
const Category = require('../helperDB/category');
const uploadSlider = require('../helperDB/slider-img');
const Slider = require('../helperDB/slider')

const userlogin=(req,res,nest)=>{
  if(req.session.login){
    nest()
  }else{
    res.redirect('/login')
  }
}



router.get('/',userlogin, function(req, res, next) {
  var role = req.session.userSession.role
  if (role === 'admin'){
    var admin =true
    res.render('admin/admin',{admin,user:req.session.userSession})
  }else{
    admin =false
    res.redirect('/')
  }
  
});

router.get('/create-video',userlogin, function(req, res, next) {
  var role = req.session.userSession.role
  if (role === 'admin'){
    var admin =true
    res.render('admin/create-video',{admin,user:req.session.userSession})
  }else{
    admin =false
    res.redirect('/')
  }
});

router.post('/create-video', 
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'img', maxCount: 1 }
  ]), 
  async (req, res) => {
      try {
          const { title, description, category } = req.body;
          const videoPath = req.files['video'] ? `uploads/video/${req.files['video'][0].filename}` : null;
          const imgPath = req.files['img'] ? `uploads/image/${req.files['img'][0].filename}` : null;

          const newVideo = new Video({
              title,
              description,
              videoPath,
              imgPath,
              category
          });

          await newVideo.save();
          res.send('Video uploaded successfully');
      } catch (error) {
          console.error(error);
          res.status(500).send('Server Error');
      }
  }
);

router.get('/all-videos',userlogin,(req,res)=>{
  var role = req.session.userSession.role
  if (role === 'admin'){
    var admin =true
    
  }else{
    admin =false
    res.redirect('/')
  }
  Video.find()
  .then((data)=>{
    res.render('admin/all-video',{admin, user:req.session.userSession, data}) 
  })
 
})

router.get('/all-user',userlogin,(req,res)=>{
  var role = req.session.userSession.role
  if (role === 'admin'){
    var admin =true
    
  }else{
    admin =false
    res.redirect('/')
  }
  User.find()
  .then((data)=>{
    res.render('admin/all-user',{admin, user:req.session.userSession, data}) 
  })
 
})
router.get('/create-category',userlogin, function(req, res, next) {
  var role = req.session.userSession.role
  if (role === 'admin'){
    var admin =true
    res.render('category/create', { admin,user:req.session.userSession });
  }else{
    admin =false
    res.redirect('/')
  }

});

router.post('/create-category', async (req, res) => {
  try {
    var role = req.session.userSession.role
    if (role === 'admin'){
      var admin =true
    }else{
      admin =false
      res.redirect('/')
    }

    // Extract newName from the request body
    const { newName } = req.body;

    // Create a new Category instance with the name from the request
    const newCategory = new Category({ name: newName });

    // Save the new category to the database
    await newCategory.save();

    // Send a success response
    res.status(201).render('category/create',{ message: 'Category created successfully'});
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/all-category',userlogin, async (req,res)=>{
  var role = req.session.userSession.role
  if (role === 'admin'){
    var admin =true
    var data = await Category.find()
    res.render('admin/all-category',{data,admin})
  }else{
    admin =false
    res.redirect('/')
  }
})
router.get('/edit-videos/:id',userlogin, async(req,res)=>{
  var role = req.session.userSession.role
  if (role === 'admin'){
    var admin =true
    var {id} = req.params
    var data = await Video.findById(id)
    res.render('admin/edit-video',{data,admin})
  }else{
    admin =false
    res.redirect('/')
  }
})

router.post('/edit-videos/:id', 
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'img', maxCount: 1 }
  ]), 
  async (req, res) => {
      try {
          const { id } = req.params;
          const { title, description, category } = req.body;
          
          // Get the existing video document
          const video = await Video.findById(id);
          if (!video) {
              return res.status(404).send('Video not found');
          }

          // Handle file uploads
          if (req.files['video']) {
              video.videoPath = `uploads/video/${req.files['video'][0].filename}`;
          }
          if (req.files['img']) {
              video.imgPath = `uploads/image/${req.files['img'][0].filename}`;
          }

          // Update other fields
          video.title = title;
          video.description = description;
          video.category = category;

          // Save the updated video
          await video.save();

          res.redirect('/admin/all-videos')
      } catch (error) {
          console.error(error);
          res.status(500).send('Server Error');
      }
  }
);

router.get('/delete-videos/:id',async (req,res)=>{
  var role = req.session.userSession.role
  if (role === 'admin'){
    var admin =true
    try{
      const id = req.params.id
      await Video.findByIdAndDelete(id)
      res.redirect('/admin/all-videos')
    }catch(err){
      console.log('Error'+err)
      res.send(err)
    }
    
  }else{
    admin =false
    res.redirect('/')
  }
})

router.get('/edit-category/:id',userlogin, async (req,res)=>{
  var role = req.session.userSession.role
  if (role === 'admin'){
    var admin =true
    var id = req.params.id
    var data = await Category.findById(id)
    res.render('admin/edit-category',{admin,data})
    
  }else{
    admin =false
    res.redirect('/')
  }

})

router.post('/edit-category/:id', async (req, res) => {
  try {
    const role = req.session.userSession.role;
    if (role !== 'admin') {
      return res.redirect('/');
    }

    const { name } = req.body;
    const { id } = req.params;

    const updatedCategory = await Category.findByIdAndUpdate(id, { name }, { new: true });
    if (!updatedCategory) {
      return res.status(404).send('Category not found');
    }

    res.redirect('/admin/all-category'); // Redirect to a page listing all categories
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Server Error');
  }
});

router.get('/delete-category/:id',async (req,res)=>{
  await Category.findByIdAndDelete(req.params.id)
  res.redirect('/admin/all-category')
})


router.get('/user-edit/:id',userlogin,async (req,res)=>{
  var role = req.session.userSession.role
  if (role === 'admin'){
    var admin =true
    var data = await User.findById(req.params.id)
    res.render('admin/user-edit',{data,admin})
    
  }else{
    admin =false
    res.redirect('/')
  }
})


router.post('/user-edit/:id', async (req, res) => {
  if (!req.session.login) {
    return res.redirect('/login');
  }

  try {
    const { fname, lname, email } = req.body;
    const userId = req.params.id

    // Check if the email already exists for a different user
    const emailExists = await User.findOne({ email });
    if (emailExists && emailExists._id.toString() !== userId.toString()) {
      return res.render('user/all-user', { emailError: "Email already in use" });
    }

    // Update user details
    const updatedUser = await User.findByIdAndUpdate(userId, { fname, lname, email }, { new: true });
    


    res.redirect('/admin/all-user'); // Redirect to profile or another page
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/delete-user/:id',userlogin, async (req, res) => {
  const role = req.session.userSession?.role;
  
  if (role !== 'admin') {
    // Redirect to home or error page if not an admin
    return res.redirect('/');
  }

  try {
    const userId = req.params.id;
    
    // Check if the user exists before attempting to delete
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).redirect('/admin/all-user?error=User not found');
    }

    // Delete the user
    await User.findByIdAndDelete(userId);
    
    // Redirect to the user list page with a success message
    res.redirect('/admin/all-user?success=User deleted successfully');
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/create-slider',userlogin,async(req,res)=>{
  var role = req.session.userSession.role
  if (role === 'admin'){
    var admin =true
    res.render('admin/slider',{ admin }) 
  }else{
    admin =false
    res.redirect('/')
  }

})

router.post('/create-slider', uploadSlider.single('sliderimg'), async (req, res) => {
  try {
    const { name, description, path } = req.body;
    const imgPath = req.file ? req.file.path : '';
    const imgFilename = req.file ? req.file.filename : '';

    const newSlider = new Slider({
      name,
      ndescriptioname: description,
      path, // Use the path field from the form
      img: imgFilename // Store the filename
    });

    await newSlider.save();
    res.send('Done')
  } catch (error) {
    console.error('Error creating slider:', error); // Log error for debugging
    res.status(500).json({ message: 'Error creating slider', error });
  }
});

router.get('/all-slider',userlogin, async (req,res)=>{
  var role = req.session.userSession.role
  if (role === 'admin'){
    var admin =true
    var data = await Slider.find()
    res.render('admin/all-slider',{data,admin})
  }else{
    admin =false
    res.redirect('/')
  }
})
module.exports = router;