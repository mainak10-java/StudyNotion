const { uploadImageCloudinary } = require('../Utils/imageUploader');
const Section = require('../models/Section')
const SubSection = require('../models/SubSection')

exports.createSubSection= async(req, res) => {
    try{
        const {title, description, sectionId} = req.body;

        const video = req.files.video;
        if(!sectionId || !title || !description || !video) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            })
        }
       
        console.log('video',video);
        const uploadedVideo = await uploadImageCloudinary(video, process.env.FOLDER_NAME);

        /*console.log(uploadedVideo);*/

        const subSectionDetails = await SubSection.create({
            title : title,
            timeDuration : `${uploadedVideo.duration}`,
            description : description,
            videoUrl : uploadedVideo.secure_url,
        })

        const updatedSection = await Section.findByIdAndUpdate({_id : sectionId},
                                                               {
                                                                    $push : {
                                                                        subSections : subSectionDetails._id
                                                                    }
                                                               },
                                                               {new : true})
                                                               .populate('subSections');
        
        res.status(200).json({
            success : true,
            message : 'Sub section created successfully',
            data : updatedSection   
        })
    } catch(error){
        console.log(error);
        return res.status(400).json({
            success:false,
            message:'Something went wrong while creating subsection',
            message: error.message
        })
    }
}

exports.updateSubSection = async(req, res) => {
    try{
        const {title, description, subSectionId, sectionId} = req.body;

        const subSectionDetails = await SubSection.findById(subSectionId);
        if(!subSectionDetails){
            return res.status(400).json({
                success : false,
                message : 'Subsection not found'
            })
        }

        if(title !== undefined){
            subSectionDetails.title = title;
        }

        if(description !== undefined){
            subSectionDetails.description = description;
        }

        if(req.files && req.files.videoFile !== undefined){
            const video = req.files.videoFile;
            const uploadedVideo = await uploadImageCloudinary(video, process.env.FOLDER_NAME);

            subSectionDetails.videoUrl = uploadedVideo.secure_url;
            subSectionDetails.timeDuration = `${uploadedVideo.duration}`;
        }

        await subSectionDetails.save();

        const updatedSection = await Section.findById(sectionId).populate('subSections');

        res.status(200).json({
            success : true,
            message : 'Section updated successfully',
            data : updatedSection
        })
    } catch(error) {
        console.log(error);
        res.status(400).json({
            success : false,
            message : 'Something went wrong while updating section'
        })
    }
}    

exports.deleteSubSection = async(req, res) => {
    try{
        const {subSectionId} = req.params;

        await SubSection.findByIdAndDelete(subSectionId);
        // TODO[Testing] : Do we need to update the details in the  section  schema or not

        res.status(200).json({
            success : true,
            message : 'Subsection deleted successfully'
        })
    } catch(error){
        console.log(error);
        res.status(400).json({
            success : false,
            message : 'Subsection deleted successfully'
        })
    }
}