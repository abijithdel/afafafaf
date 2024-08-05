var express = require('express');
var router = express.Router();
var Video = require('../helperDB/video')
var User = require('../helperDB/user')
var bcrypt = require('bcrypt');
const Category = require('../helperDB/category')
const Slider = require('../helperDB/slider')
const Playlist = require('../helperDB/playlist')

/* GET home page. */
const userlogin=(req,res,nest)=>{
  if(req.session.login){
    nest()
  }else{
    res.redirect('/login')
  }
}

router.get('/', async (req, res) => {
  try {
      const media = await Video.find();
      const newCategory = await Category.find()
      const sliderData = await Slider.find()
      res.render('user/index', { newCategory,media , user:req.session.userSession,sliderData}); 
  } catch (error) {
      res.status(500).send('Error fetching media');
  }
});
router.get('/anime', async function(req, res, next) {
  var query = 'Anime'
  const videos = await Video.find({ category: new RegExp(query, 'i') });
  const newCategory = await Category.find()
  res.render('user/anime', {newCategory,user:req.session.userSession,videos});
});

router.get('/movie',async function(req, res, next) {
  var query = 'Movie'
  const videos = await Video.find({ category: new RegExp(query, 'i') });
  const newCategory = await Category.find()
  res.render('user/movie', {newCategory,user:req.session.userSession,videos});
});

router.get('/video/:id', async function(req, res, next) {
  try {
    const { id } = req.params;
    const spVideo = await Video.findById(id);
    
    if (!spVideo) {
      return res.status(404).send('Video not found');
    }

    spVideo.views += 1;
    await spVideo.save();

    const newCategory = await Category.find();
    const spCategory = await Video.find({ category: new RegExp(spVideo.category, 'i') });


    res.render('user/video', { newCategory, spVideo, user: req.session.userSession, spCategory});

  } catch (error) {
    next(error);
  }
});



router.get('/signup', async function(req, res) {
  if (req.session.login) {
    res.redirect('/')
  } else {
    const newCategory = await Category.find()
    res.render('user/signup',{newCategory});
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { fname, lname, email, pass, cpass } = req.body;

    // Check if email already exists
    const emailValid = await User.findOne({ email });
    if (emailValid) {
      return res.render('user/signup', { emailError: "email already exists" });
    }

    if (pass !== cpass) {
      return res.status(400).render('user/signup', { passError: 'Passwords do not match.' });
    }

    // Hash the password
    const hashedPass = await bcrypt.hash(pass, 10);

    // Create new user using NewUser
    const newUser = new User({
      fname,
      lname,
      email,
      pass: hashedPass,
    });

    req.session.login = true;
    req.session.userSession = newUser;

    await newUser.save();
    res.status(201).redirect('/');
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/login', async function(req, res, next) {
  if (req.session.login) {
    res.redirect('/')
  } else {
    const newCategory = await Category.find()
    res.render('user/login',{newCategory});
  }
});


router.post('/login', async (req, res) => {
  const { email, pass } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).render('user/login', { error: 'User not found. Please sign up.' });
    }

    const passMatch = await bcrypt.compare(pass, user.pass);
    if (passMatch) {
      req.session.login = true;
      req.session.userSession = user;
      res.redirect('/');
    } else {
      res.status(401).render('user/login', { error: 'Incorrect password.' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.redirect('/');
  });
});

router.post('/search', async (req, res) => {
  try {
    const { query } = req.body; // Make sure 'query' matches the input field name
    console.log(query);
    
    if (!query) {
      return res.render('user/search', { videos: [] });
    }

    // Perform search
    const videos = await Video.find({ title: new RegExp(query, 'i') }); // Case-insensitive search
    res.render('user/search', { videos , user:req.session.userSession});
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

router.get('/edit-profile',userlogin, async(req,res)=>{
  const newCategory = await Category.find()
  res.render('user/edit-profile',{newCategory,user:req.session.userSession})
})

router.post('/edit-profile/:uid', async (req, res) => {
  try {
    const userId = req.params.uid;
    const updateData = {
      fname: req.body.fname,
      lname: req.body.lname,
      email: req.body.email,
    };
    // Update user data
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedUser) {
      return res.status(404).send('User not found');
    }

    // Optionally update session data if needed
    req.session.userSession = updatedUser;
    const newCategory = await Category.find()
    res.render('user/edit-profile',{done:'profile updated successfully',newCategory,user:req.session.userSession}); // Redirect to the profile page or another route
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/reset-password',async(req,res)=>{
  const newCategory = await Category.find()
  res.render('user/reset-pass',{newCategory,user:req.session.userSession})
})

router.post('/reset-password/:uid', userlogin, async (req, res) => {
  try {
    const { password, cpassword } = req.body;
    const { uid } = req.params;

    // Check if passwords match
    if (password !== cpassword) {
      return res.status(400).render('user/reset-pass',{error:'Passwords do not match',user:req.session.userSession});
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Find the user and update the password
    const updatedUser = await User.findByIdAndUpdate(
      uid,
      { pass: hashedPassword },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).send('User not found');
    }

    // Optionally, update session data or redirect
    req.session.userSession = updatedUser; // Update session if needed

    res.render('user/reset-pass',{user:req.session.userSession,done:'password reset successfully'}); 
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/playlist', userlogin, async (req, res) => {
  const userId = req.session.userSession;
  const newlist = []
  const newCategory = await Category.find()
  try {
    // Find the playlist for the user
    const playlist = await Playlist.findOne({ userid: userId }).populate('video.videoid');
    
    // playlist.video.videoid

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    for (var i=0;i<playlist.video.length;i++){
      var vId = playlist.video[i].videoid
      var inVideo = await Video.findById(vId)
      if (inVideo){
        newlist.push(inVideo)
      }
    }

    // Render the playlist page with the playlist data
    res.render('user/playlist', { newlist ,user:req.session.userSession, newCategory});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/playlist/:id', userlogin, async (req, res) => {
  const videoId = req.params.id;
  const userId = req.session.userSession;

  try {
    // Find the playlist for the user
    let playlist = await Playlist.findOne({ userid: userId });

    if (!playlist) {
      // Create a new playlist if it doesn't exist
      playlist = new Playlist({ userid: userId });
    }

    // Check if the video is already in the playlist
    const videoExists = playlist.video.some(v => v.videoid === videoId);

    if (!videoExists) {
      // Add the video to the playlist
      playlist.video.push({ videoid: videoId });
    }

    // Save the playlist
    await playlist.save();

    // Send a success response
    res.status(200).redirect('/playlist')
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
