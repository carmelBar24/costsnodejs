/*Developers Details:
* David Daida - 313374373
* Carmel Bar - 207895103
*/
// Define the function developersDetails
function developersDetails() {

    // Define an array of developer objects
    const developers = [
        {
            firstName:'David',
            lastName:'Daida',
            id:'313374373',
            email:'daviddaida95@gmail.com'
        },
        {
            firstName:'Carmel',
            lastName:'Bar',
            id:'207895103',
            email:'carmelbar9@gmail.com'
        },
    ];

    // Return the JSON string representation of the developers array
    return JSON.stringify(developers);
};

// Export the developersDetails function as a property of the module exports object
module.exports.developersDetails = developersDetails;
