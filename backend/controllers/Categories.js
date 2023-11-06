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

exports.categoryPageDetails = async(req, res) => {
    try{
        const {categoryId} = req.body;

        const selectedCategory = await Category.findById(categoryId).populate('courses').exec();

        //Handle the case where no such category exists
        if(!selectedCategory){
            return res.status(404).json({
                success : false,
                message : 'Data not found'
            })
        }

        //Handle the case where no courses are there in the selected category
        if(selectedCategory.courses.length === 0){
            console.log('No courses found in this category');
            return res.status(404).json({
                success : false,
                message : 'No courses found for the selected category'
            })
        }

        const differentCategories = await Category.find({_id : {$ne : categoryId}}).populate('courses').exec();

        console.log(differentCategories);

        const differentCourses = [];
        for(const category of differentCategories){
            differentCourses.push(...category.courses);
        }

        const allCategoires = await Category.find({}).populate('courses').exec();
        const allCourses = allCategoires.flatMap((category) => category.courses);

        const mostSellingCourses = allCourses.sort((a,b) => b.sold - a.sold).slice(0, 10);

        return res.status(200).json({
            success : true,
            data : {
                selectedCategory,
                differentCategories,
                mostSellingCourses
            }
        })
    } catch(error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}