const {File, Idea} = require('../models/Idea');

exports.uploadFile = async (req, res,next) => {
    try {
        
        const idea = new Idea();
        idea.title =req.body.title
        idea.content = req.body.content
        idea.category = '6400840bd62ad3650a510427'
        idea.user = req.user
        idea.save((err)=>{

            if (err) { return next(err); }
        });
          //as      

        const files = req.files;
        const uploadPromises = files.map(file => {
            const newFile = new File({
                name: file.originalname,
                files: file.buffer,
                user: req.user,
                ideas:idea
            });
            return newFile.save();
        });
        const uploadedFiles = await Promise.all(uploadPromises);
        res.redirect('/');
    } catch (err) {
        res.status(500).send(err.message);
    }
};