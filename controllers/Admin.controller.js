import Requests from "../models/CompanyVerify.model.js";
import Users from "../models/Users.model.js";
import Seller from "../models/Seller.model.js";


export const  getAllRequest = async(req,res,next) => {

    try{
    const AllRequest = await Requests.find({ State:false});
    res.status(200).send(AllRequest);
    } catch(err){
        res.status(500).send("error fetching data ");
    }
};

export const VerifySeller = async(req,res,next)=>{

    try{

        const RequestID = req.body.resquestID;
        const UserID = req.body.userID;
        console.log("the reqid "+RequestID+" the user "+UserID);
        await Users.findByIdAndUpdate({ _id: UserID},{isSeller:true});
        await Requests.findByIdAndUpdate({_id: RequestID},{State:true});
        const requestData = await Requests.findById(RequestID);

        console.log("the data : "+requestData);
       const sendData = new Seller({
            userID: requestData.userID,
            businessName : requestData.businessName,
            businessWebsite : requestData.businessWebsite? requestData.businessWebsite:'',
            businessStructure: requestData.businessStructure?requestData.businessStructure:'',
            businessDescription: requestData.businessDescription,
            primaryContactName: requestData.primaryContactName,
            streetAddress: requestData.streetAddress,
            city: requestData.city,
            state:requestData.Countrystate,
            zip:requestData.zip,
            country:requestData.country,
            ProfilePic:'',
            

        })
        await  sendData.save();
        res.status(200).send("user verified successfully");

    }catch(err){
        res.status(500).send("error Verifying  company ");
    }


};

