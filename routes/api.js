var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require("../models/user");
var Book = require("../models/book");
var Profile = require("../models/profile");
var Contact = require("../models/contact");
var Dialog = require("../models/dialog");
var Target = require("../models/target");



router.post('/signup', function(req, res) {
  if (!req.body.username || !req.body.password) {
    res.json({success: false, msg: 'Please pass username and password.'});
  } else {
    var newUser = new User({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Username already exists.'});
      }
      res.json({success: true, msg: 'Successful created new user.'});
    });
  }
});

router.post('/signin', function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.sign(user, config.secret);
          // return the information including token as JSON          
          res.json({success: true, token: 'JWT ' + token, user: user});
        } else {
          res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});
router.post('/updateUser', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
      User.update(
        {
          '_id': req.body.userId         
        },
        {    
           $set: {
            "username": req.body.username,
            "password": req.body.password,
            "email": req.body.email,
            "avatar": req.body.avatar
           }    
         
        }        
        ,function (err, user) {
          if (err) return next(err);            
          res.json({success: true, msg: 'Successful update user.', user: user});
        });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});




//BOOKS

router.post('/book', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    console.log(req.body);
    var newBook = new Book({
      isbn: req.body.isbn,
      title: req.body.title,
      author: req.body.author,
      publisher: req.body.publisher
    });

    newBook.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Save book failed.'});
      }
      res.json({success: true, msg: 'Successful created new book.'});
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.get('/book', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    Book.find(function (err, books) {
      if (err) return next(err);
      res.json(books);
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

//KONTAKTY
router.get('/contacts/:userId', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {   
    Contact.find({'userId': req.params.userId},function (err, contacts) {
      if (err) return next(err);      
      console.log("Kontakty uzytkownika");
      console.log(contacts);
      res.json({success: true, contacts: contacts});      
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.get('/contact/:contactId', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {   
    User.findOne({'_id': req.params.contactId},function (err, contact) {
     
      if (err) return next(err);              
      res.json({success: true, contact: contact});      
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});


router.get('/contacts', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    User.find(function (err, contacts) {
      if (err) return next(err);
      res.json({success: true, 
        contacts: contacts.map(function(contact){
          return {
            id: contact._id,
            name: contact.username
          }
        })
      });      
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.get('/invitations/:userId', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {   
    Contact.find({
      'contactId': req.params.userId,
      'status': 'pending'
    },function (err, invitations) {
      if (err) return next(err);           
      res.json({success: true, invitations: invitations});      
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.post('/acceptInvitations/:id', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    console.log(req.body);    

    var newContact = new Contact({
        userId: req.body.userId,
        contactId:  req.body.contactId,       
        contactName: req.body.contactName,
        userName: req.body.userName,
        status: 'accepted'       
    });
    newContact.save(function(err) {
      if (err) {
        console.log(err)
        return res.json({success: false, msg: 'Update contact failed.'});
      }
      Contact.findOneAndUpdate(
      {
        '_id': req.params.id
      },
      {        
        'status': 'accepted'
      },function (err, invitations) {
        if (err) return next(err);           
         res.json({success: true, msg: 'Successful update contact.'});  
      });
     
    }); 
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.post('/contacts', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    console.log(req.body);    
    var newContact = new Contact({
        userId: req.body.userId,
        contactId: req.body.contactId,       
        contactName: req.body.contactName,
        userName: req.body.userName,
        status: 'pending'       
    });
    newContact.save(function(err) {
      if (err) {
        console.log(err)
        return res.json({success: false, msg: 'Save contact failed.'});
      }
      res.json({success: true, msg: 'Successful created new contact.'});
    }); 


   
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});


router.delete('/contacts/:id', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    Contact.remove({ '_id': req.params.id },function (err) {
       if (err) {
        console.log(err)
        return res.json({success: false, msg: 'Delete contact failed.'});
      }
      res.json({success: true, msg: 'Successful delete contact.'});
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});



//DIALOG
router.post('/dialog', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    console.log(req.body);
    var dialog = {
        userId: req.body.userId,
        contactId: req.body.contactId,       
        contactName: req.body.contactName,       
        text: req.body.text,       
        lp: req.body.lp,       
        type: req.body.type,
        status: 'new',
        fileName: req.body.fileName,       
        fileContent: req.body.fileContent      
    };
    var newDialog = new Dialog(dialog);
    newDialog.save(function(err, dial) {
      if (err) {
        console.log(err)
        return res.json({success: false, msg: 'Save dialog failed.'});
      }
      if(req.app.io.sockets.adapter.rooms[req.body.userId + req.body.contactId]){           
        req.app.io.sockets.in(req.body.userId + req.body.contactId).emit('newMessage', dial);             
      }else if(req.app.io.sockets.adapter.rooms[req.body.contactId + req.body.userId]){         
        req.app.io.sockets.in(req.body.contactId + req.body.userId).emit('newMessage', dial);  
      }     
      res.json({success: true, msg: 'Successful created new dialog.'});
    }); 
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.post('/checkDialog/:dialogId', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
      Dialog.update(
        {
          '_id': req.params.dialogId         
        },
        {        
          'status': 'old'
        }        
        ,function (err, invitations) {
          if (err) return next(err);            
          res.json({success: true, msg: 'Successful update dialog.'});
        });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});


router.post('/dialogsByContact/:userId', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {   
    Dialog.find({
        'userId': req.params.userId,
        'contactId': req.body.contactId,
      },function (err, dialogs1) {
        if (err) return next(err);
        Dialog.find({
          'userId': req.body.contactId,
          'contactId': req.params.userId,
        },function (err, dialogs2) {
        if (err) return next(err);             
        var dialogs = dialogs1.concat(dialogs2);       
        Dialog.update(
        {
          'userId': req.body.contactId,
          'contactId': req.params.userId
        },
        {        
          'status': 'old'
        },
        {
          multi: true
        }
        ,function (err, invitations) {
          if (err) return next(err);            
          dialogs.sort(function(a, b){return a.lp-b.lp}); 
          console.log("try connect");
          console.log('a user connected');
          console.log(req.app.socket.client.id);

          console.log("JOIN TO USER ROOM");
          
         // req.app.socket.join(req.params.userId + req.body.contactId);   
          console.log("Availeble rooms:");
          console.log(req.app.io.sockets.adapter.rooms)  
          if(req.app.io.sockets.adapter.rooms[req.params.userId + req.body.contactId]){
            console.log("Jest taki pokój 1");
            req.app.socket.join(req.params.userId + req.body.contactId);   
          }else if(req.app.io.sockets.adapter.rooms[req.body.contactId + req.params.userId]){
            console.log("Jest taki pokój 2");
            req.app.socket.join(req.body.contactId + req.params.userId);   
          }else {
            console.log("nie ma takiego pokoju ");
            req.app.socket.join(req.params.userId + req.body.contactId);  
          }
          res.json({success: true, dialogs: dialogs}); 
        });
             
      });            
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});


router.post('/dialogsNew/:userId', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {   
    Dialog.find({
        'contactId': req.params.userId,
        'status': 'new'
      },function (err, dialogs) {
        if (err) return next(err);                         
        res.json({success: true, dialogs: dialogs}); 
             
      });                
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});


//PROFILE
router.post('/profile', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    console.log(req.body);    
    Profile.findOne({ 'userId': req.body.userId }, function (err, profile) {
       if(profile){
          profile.name = req.body.name;
          profile.gender = req.body.gender;
          profile.age = req.body.age;
          profile.weight = req.body.weight;
          profile.growth = req.body.growth;         
          profile.save(function(err) {
            if (err) {
              return res.json({success: false, msg: 'Save profile failed.'});
            }
            res.json({success: true, msg: 'Successful update profile.'});
          });
       }else{
          var newProfile = new Profile({
            userId: req.body.userId,
            name: req.body.name,
            gender: req.body.gender,
            age: req.body.age,
            weight: req.body.weight,
            growth: req.body.growth
          });
          newProfile.save(function(err) {
            if (err) {
              console.log(err)
              return res.json({success: false, msg: 'Save profile failed.'});
            }
            res.json({success: true, msg: 'Successful created new profile.'});
          });
       }
    });    
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.get('/profile/:userId', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    Profile.findOne({'userId': req.params.userId},function (err, profile) {
      if (err) return next(err);
      res.json({success: true, profile: profile});      
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});


//TARGET
router.post('/target', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    console.log(req.body);    
    Target.findOne({ 'userId': req.body.userId }, function (err, target) {
       if(target){         
          target.type = req.body.type;
          target.value = req.body.value;                  
          target.save(function(err) {
            if (err) {
              return res.json({success: false, msg: 'Save target failed.'});
            }
            res.json({success: true, msg: 'Successful update target.'});
          });
       }else{
          var newTarget = new Target({
            userId: req.body.userId,
            type: req.body.type,
            value: req.body.value           
          });
          newTarget.save(function(err) {
            if (err) {
              console.log(err)
              return res.json({success: false, msg: 'Save target failed.'});
            }
            res.json({success: true, msg: 'Successful created new target.'});
          });
       }
    });    
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

module.exports = router;
