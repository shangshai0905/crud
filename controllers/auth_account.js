let mysql2 = require('mysql2');
let encrypt = require('bcrypt');
let jwt = require('jsonwebtoken');

let db = mysql2.createConnection(
    {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE,
        port: process.env.DATABASE_PORT
    })


    function magic(value) {
        return value.trim().charAt(0).toUpperCase() + value.trim().slice(1);
    }
exports.addAccount = (req,res) => {

    //destructure
    let {first_name, last_name, course_id, email} = req.body

    first_name = magic(first_name);
    last_name = magic(last_name);
    email = email.trim();


    db.query('SELECT stud.student_id, stud.first_name, stud.last_name , stud.email, c.course_name, c.course_description FROM students AS stud INNER JOIN courses AS c ON stud.course_id = c.course_id where email = ?', email,
    async (err, result) => {
        if (err) {
            return console.log("Error Message:" + err)
        } else {
            if (result.length > 0) {
                console.log("Email already exists: " + email)
                return res.render("register", 
                    {
                        message: "Email " + email + " already exists! Please use other email."
                    })
            } 
            else {
                db.query('insert into students set ?',
                [
                    {
                        first_name: first_name,
                        last_name: last_name,
                        course_id: course_id,
                        email: email,
                    }
                ],
                    (err, result) => 
                    {
                        if (err) {
                            return console.log("Error Message:" + err)
                        } else {
                            console.log(result)
                            return res.render("register", 
                            {
                                message: "Student has been added succesfully."
                            })
                        }
                    }
                )
            
            }
        }
    }

    )
    }


exports.loginAccount = async (req, res) => {
    try {
        const {email, password} = req.body
        if (email == '' && password == '') 
            {
                return res.render("index", 
                    {
                        message: "Email and Password field should not be empty"
                    })
            }
        else 
            {
                db.query("select * from user where email = ?", email, 
                async(err, result) =>
                {
                    if (!result[0]) 
                        {
                            return res.render("index", 
                                {
                                    message: "Email is incorrect"
                                }
                                )
                        }
                        
                    else if (!(await encrypt.compare(password, result[0].password)))
                        {
                            return res.render("index", 
                            {
                                message: "Password is incorrect"
                            }
                            )
                        }
                    else {
                        let user_id = result[0].user_id
                        let token = jwt.sign(user_id, process.env.JWT_SECRET);
                        let cookieOption = {expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES *24 *60 *1000), httpOnly: true}
                        //*24 *60 *1000 means 1 day

                        res.cookie("cookie_access_token", token, cookieOption)


                        console.log(cookieOption)
                        console.log("Token: " + token)
                        db.query("SELECT stud.student_id, stud.first_name, stud.last_name, stud.email, c.course_name, c.course_description FROM students AS stud INNER JOIN courses AS c ON stud.course_id = c.course_id ORDER BY stud.student_id", (err, result) => {
                            if (err) {
                                console.log("Error Message" + err)
                            }
                            else if (!result){
                                return res.render("viewAccounts", 
                                    {
                                        message: "No result found"
                                    }
                            )
                            }
                            else {
                                return res.render("viewAccounts", 
                                    {
                                        title: "List of Students",
                                        data: result
                                    }
                            )
                            }
                        }
                        )
                    }
                })
            }
    }
    catch (err) {
        console.log("Error Message:" + err)
    }
}

exports.updateForm = (req, res) => {
    const student_id = req.params.student_id;
    console.log(student_id)
    db.query("select * from students where student_id = ?", student_id, 
    (err, result) =>
    {
        if (err) {
            return console.log("Error Message:" + err)
        }
        if (result) {
            return res.render("updateForm", 
                {
                    title: "Update User Account",
                    result: result[0]
                }
            )
        }
    } 
    )
}

exports.updateUser = (req, res) => {
    let {first_name, last_name, student_id} = req.body

    first_name = magic(first_name);
    last_name = magic(last_name);

    db.query("Update students Set first_name = ?, last_name = ? where student_id = ? ", [first_name, last_name, student_id],
    (err, result) =>
    {
        if (err) {
            return console.log("Error Message:" + err)
        }
        else {
            db.query("SELECT stud.student_id, stud.first_name, stud.last_name, stud.email, c.course_name, c.course_description FROM students AS stud INNER JOIN courses AS c ON stud.course_id = c.course_id ORDER BY stud.student_id", (err, data) => {
                if (err) {
                    console.log("Error Message" + err)
                }
                else if (!data) {
                    return res.render("viewAccounts", 
                    {
                        message: "No Results Found",
                    }
                    )
                }
                else{
                    return res.render("viewAccounts", 
                        {
                            title: "List of Students",
                            data: data
                        }
                        )
                    }
                    }
                    )
                }
            }
            )
        }

exports.deleteUser = (req, res) => {
    const student_id = req.params.student_id
    db.query("DELETE FROM students WHERE student_id = ?", [student_id], (err, result) =>
    {
        if (err) {
            console.log("Error Message:" + err)
        } else {
            db.query("SELECT stud.student_id, stud.first_name, stud.last_name, stud.email, c.course_name, c.course_description FROM students AS stud INNER JOIN courses AS c ON stud.course_id = c.course_id ORDER BY stud.student_id", 
            (err, result) => {
                if (err) {
                    console.log("Error Message" + err)
                }
                else if(!result[0]) {
                    return res.render("viewAccounts", 
                    {
                        message: "No Results Found",
                    }
                    )
                } else {
                    return res.render("viewAccounts", 
                        {
                            title: "List of Students",
                            data: result
                        }
                        )
                }
            }
            )
        }
    })
}

exports.logoutAccount = (req, res) => {
    res.clearCookie("cookie_access_token").status(200)
    return res.render("index")
}

exports.back = (req, res) => {
    db.query("SELECT stud.student_id, stud.first_name, stud.last_name, stud.email, c.course_name, c.course_description FROM students AS stud INNER JOIN courses AS c ON stud.course_id = c.course_id ORDER BY stud.student_id", 
    (err, result) => {

    return res.render("viewAccounts",
    {
        title: "List of Students",
        data: result
    }
    )
})
}