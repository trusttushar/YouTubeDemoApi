const User =require('../models/user');
const Video =require('../models/video');
const {GraphQLObjectType,GraphQLList, GraphQLString, GraphQLSchema,GraphQLID, GraphQLNonNull} = require('graphql');
const {createUser, UserSignin} = require("./resolvers")




const VideoType = new GraphQLObjectType({
    name:"Video",
    fields:()=>({
        _id:{type: GraphQLID},
        title: {type: GraphQLString},
        discription: {type: GraphQLString},
        thumbnail : {type: GraphQLString},
        fileName:{type: GraphQLString},
        userId:{type: GraphQLString}
    })
})



const UserType = new GraphQLObjectType({
    name:"User",
    fields:()=>({
        _id:{type: GraphQLID},
        firstName: {type: GraphQLString},
        larstName: {type: GraphQLString},
        email: {type: GraphQLString},
        password: {type: GraphQLString},
        token:{type: GraphQLString},
        video:{type:new GraphQLList(VideoType)}
    })
})

const RootQuery  = new GraphQLObjectType({
    name: "RootQueryType",
    fields:{
        user:{
            type:UserType,
            async resolve(parent,args,context){
            let userId = context.user.id;
            let data = await User.findOne({_id:userId}).populate('video').exec()
            return data;
            }
        },
        getVideo:{
            type:VideoType,
            args:{_id: {type: GraphQLID}, title: {type: GraphQLString}},
            resolve(parent,args){
                return Video.findOne(args) 
            }
        },
        searchVideos:{
            type:new GraphQLList(VideoType),
            args:{title: {type: GraphQLString}},
            async resolve(parent,args){
                if(!args.title){
                    return [];
                }
                let data = await Video.find({title: { '$regex':args.title}});
                return data
            }
        },
        getVideos:{
            type:new GraphQLList(VideoType),
            async resolve(parent,args){
                let data = await Video.find();
                return data
            }
        }
    }
})
// --------------------- mutations ----------------------

const Mutation = new GraphQLObjectType({
    name:'Mutation',
    fields:{
        addVideo:{
           type: VideoType,
           args:{
            title: {type: new GraphQLNonNull(GraphQLString)},
            discription: {type: new GraphQLNonNull(GraphQLString)},
            thumbnail : {type: new GraphQLNonNull(GraphQLString)},
            fileName:{type: new GraphQLNonNull(GraphQLString)}
           },
           async resolve(parent,args,context){
            let userId = context.user.id;
                let videoToSave = new Video({
                    title: args.title,
                    discription: args.discription,
                    thumbnail: args.thumbnail,
                    fileName: args.fileName,
                    userId: userId
                });
                let savedVideo = await videoToSave.save();
                await User.updateOne({_id:userId},{$push:{video:videoToSave._id}})
                return savedVideo;
           }
        },
        SignUp:{
            type: UserType,
            args:{
                firstName: {type: new GraphQLNonNull(GraphQLString)},
                lastName: {type: new GraphQLNonNull(GraphQLString)},
                email: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)}
            },
            async resolve(parent,args){
                let data = await createUser(args);
                return data;
           }
         },
         Signin:{
            type: UserType,
            args:{
                email: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)}
            },
            async resolve(parent,args){
                let data = await UserSignin(args);
                return data;
           }
         },
         deleteVideo:{
            type: VideoType,
            args:{
                _id: {type: new GraphQLNonNull(GraphQLID)},
            },
            async resolve(parent,args,context){
                console.log("************",args)
                let userId = context.user.id;
                let data = await Video.deleteOne( { _id: args._id } );
                await User.updateOne({_id:userId},{$pull:{video:args._id}})
                console.log("kikooo",data)
                return data;
           }
         },
    }
})
module.exports= new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
})
// const {buildSchema} = require('graphql');
// module.exports = buildSchema(`
// type User {
//     _id:ID!
//     email:String!
//     firstName:String!
//     lastName:String!
// }
// input UserInputData {
//     email:String!
//     firstName:String!
//     lastName:String!
//     password:String!
// }


// type UserAuthData {
//     token:String!
//     userId:String!
// }

// type RootMutation {
//     createUser(userInput:UserInputData): User!
// }
// type RootQuery {
//     Userlogin(email:String! password:String!):UserAuthData!
// }

// schema {
//     query:RootQuery
//     mutation:RootMutation
// }
// `)

