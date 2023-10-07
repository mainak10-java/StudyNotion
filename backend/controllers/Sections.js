const Course = require('../models/Course')
const Section = require('../models/Section')


exports.createSection = async(req, res) => {
    try{
        const {sectionName, courseId} = req.body;
        
        if(!sectionName || !courseId){
            return res.status(400).json({
                success : false,
                message : 'All fields must be filled'
            })
        }

        const newSection = await Section.create({sectionName});

        // Update the course and display the course content instead of id with populate
        const updatedCourse = await Course.findByIdAndUpdate(courseId,
                                                             {
                                                                $push : {
                                                                    courseContent : newSection._id
                                                                }
                                                            },
                                                            {new : true})
                                                            .populate({  
                                                                path : 'courseContent',
                                                                populate : {
                                                                    path : 'subSections'
                                                                }
                                                            })
                                                            .exec()
        
        res.status(200).json({
            success : true,
            message : 'Section created successfully',
            data : updatedCourse
        })
    } catch(error){
        console.log(error);
        return res.status(400).json({
            success : false,
            message : 'Something went wrong while creating section'
        })
    }
}

exports.updateSection = async(req, res) => {
    try{
        const {sectionName, sectionId} = req.body;

        if(!sectionName || !sectionId){
            return res.status(400).json({
                success : false,
                message : 'All fields must be filled'
            })
        }

        const updatedSection = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new : true});

        // TODO[Testing] : Do we need to update the details in the  course  schema or not

        res.status(200).json({
            success : true,
            message : 'Section updated successfully',
            data : updatedSection
        })
    } catch(error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : 'Something went wrong while updating section'
        })
    }
}

exports.deleteSection = async(req, res) => {
    try{
        const {sectionId} = req.params;

        await Section.findByIdAndDelete(sectionId);
        // TODO[Testing] : Do we need to update the details in the  course  schema or not

        return res.status(200).json({
            success:true,
            message:"Section Deleted Successfully",
        })

    } catch(error) {
        return res.status(500).json({
            success:false,
            message:"Unable to delete Section, please try again",
            error:error.message,
        });
    }
}
