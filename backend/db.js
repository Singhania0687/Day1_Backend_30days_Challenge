const mongoose =require("mongoose")

// Main DB
 const mainDB = async () => {
    try {
        await mongoose.connect("mongodb://host.docker.internal:27017/mydatabase");
        console.log("Main DB Connected");
    } catch (err) {
        console.log("Main DB connection error:", err);
    }
};

// Second DB using createConnection()
 const deviceDB = mongoose.createConnection("mongodb://host.docker.internal:27017/deviceStatusDB");

deviceDB.on("connected", () => {
    console.log("Device Status DB Connected");
});

deviceDB.on("error", (err) => {
    console.log("Device Status DB error:", err);
});
module.exports={mainDB,deviceDB}
