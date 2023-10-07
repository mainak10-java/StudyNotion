const Category = require('../models/Category')


exports.createCategory = async(req, res) => {
    try{
        const {name, description} = req.body;

        if(!name || !description){
            return res.status(400).json({
                success : false,
                message : 'All fields are required'
            })
        }

        const categoryDetails = await Category.create({
            name : name, 
            description : description
        })

        res.status(200).json({
            success : true,
            message : 'Tag created successfully'
        })
    } catch(error){
        console.log(error);
        return res.status(400).json({
            success : false,
            message : 'Something went wrong while creating tag, please try again later'
        })
    }
}

exports.getAllCategories = async(req, res) => {
    try{
        const allCategoires = await Category.find({}, {name : true, description : true})

        req.status(200).json({
            success : true,
            message : 'All tags returned successfully',
            data : allCategoires
        })
    } catch(error){
        return res.status(400).json({
            success : false,
            message : 'Something went wrong while fetching tags, please try again later'
        })
    }
}