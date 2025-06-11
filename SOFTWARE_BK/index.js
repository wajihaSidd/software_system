const express = require('express');

const cors = require('cors');

const pool = require('./db')

require('dotenv').config();


const app = express();

app.use(cors());
app.use(express.json());



app.get('/welcomeMessage', async (req, res) => {
    try {
        res.json('WELCOME TO CYBROX SOFTWARE HOUSE');
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});


app.get('/employees', async (req, res) => {
    try {
        const result = await pool.query('select * from employees');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});




app.get('/departments', async (req, res) => {
    try {
        const result = await pool.query('select * from departments');

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});

app.get('/projects', async (req, res) => {
    try {
        const result = await pool.query('SELECT * from projects');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});

app.get('/attendance', async (req, res) => {
    try {
        const result = await pool.query('SELECT * from attendance');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});

app.get('/clients', async (req, res) => {
    try {
        const result = await pool.query('SELECT * from clients');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});

app.get('/contracts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * from contracts');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});

app.get('/cybersecuritylogs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * from cybersecuritylogs');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});

app.get('/invoices', async (req, res) => {
    try {
        const result = await pool.query('SELECT * from invoices');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});

app.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * from tasks');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});

app.get('/teams', async (req, res) => {
    try {
        const result = await pool.query('SELECT * from teams');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});


app.get('/users', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: err.message });
    }
    });



app.post('/employee', async (req, res) => {
    const { firstname, lastname, cnic, gender, email, phone, hiredate, jobtitle, salary, bankaccount, departmentid } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO employees 
            (firstname, lastname, gender, cnic, email, phone, hiredate, jobtitle, salary, bankaccount, departmentid) 
            VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
            RETURNING *`,
            [firstname, lastname, gender, cnic, email, phone, hiredate, jobtitle, salary, bankaccount, departmentid]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error inserting employee:", err.stack); // Log full error details
        res.status(500).json({ error: err.message });
    }
});



app.post('/department', async (req, res) => {
    const { departmentname, budget, location, contactemail, contactphone, description, departmentheadid } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO departments 
            (departmentname, budget, location, contactemail, contactphone, description, departmentheadid) 
            VALUES 
            ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [departmentname, budget, location, contactemail, contactphone, description, departmentheadid]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/project', async (req, res) => {
    const { 
        projectname, description, clientid, contractid, startdate, deadline,
        budget, estimatedhours, projectmanagerid, status, technologystack, repositoryurl 
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO projects 
            (projectname, description, clientid, contractid, startdate, deadline, budget, 
             estimatedhours, projectmanagerid, status, technologystack, repositoryurl) 
            VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
            RETURNING *`,
            [
                projectname, description, clientid, contractid, startdate, deadline, budget, 
                estimatedhours, projectmanagerid, status, technologystack, repositoryurl
            ]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Database Insert Error:", err);
        res.status(500).json({ error: err.message });
    }
});





app.post('/invoice', async (req, res) => {
    const { 
        invoicenumber, projectid, clientid, issuedate, duedate, amount, taxamount, 
        discount, totalamount, status, paymentmethod, paymentdate, notes, createdby 
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO invoices 
            (invoicenumber, projectid, clientid, issuedate, duedate, amount, taxamount, 
             discount, totalamount, status, paymentmethod, paymentdate, notes, createdby) 
            VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
            RETURNING *`,
            [
                invoicenumber, projectid, clientid, issuedate, duedate, amount, taxamount, 
                discount, totalamount, status, paymentmethod, paymentdate, notes, createdby
            ]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/attendances', async (req, res) => {
    const { 
        employeeid, date, checkin, checkout, status, leavetype, hoursworked, notes, approvedby 
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO attendance 
            (employeeid, date, checkin, checkout, status, leavetype, hoursworked, notes, approvedby) 
            VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *`,
            [
                employeeid, date, checkin, checkout, status, leavetype, hoursworked, notes, approvedby
            ]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error inserting attendance record:", err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/user', async (req, res) => {
    const { 
        username, passwordhash, email, accesslevel, accountstatus, 
        lastlogin, failedloginattempts, twofactorenabled, employeeid 
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO users 
            (username, passwordhash, email, accesslevel, accountstatus, lastlogin, failedloginattempts, twofactorenabled, employeeid) 
            VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *`,
            [
                username, passwordhash, email, accesslevel, accountstatus, 
                lastlogin, failedloginattempts, twofactorenabled, employeeid
            ]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/cybersecuritylog', async (req, res) => {
    const { 
        eventtype, userid, ipaddress, eventtimestamp, description, 
        severity, actiontaken, status, relatedentitytype, relatedentityid 
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO cybersecuritylogs 
            (eventtype, userid, ipaddress, eventtimestamp, description, severity, actiontaken, status, relatedentitytype, relatedentityid) 
            VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *`,
            [
                eventtype, userid, ipaddress, eventtimestamp, description, 
                severity, actiontaken, status, relatedentitytype, relatedentityid
            ]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




app.post('/client', async (req, res) => {
    const { 
        companyname, contactperson, email, phone, address, 
        industry, taxnumber, paymentterms, clientsince, status, accountmanagerid 
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO clients 
            (companyname, contactperson, email, phone, address, industry, taxnumber, paymentterms, clientsince, status, accountmanagerid) 
            VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
            RETURNING *`,
            [
                companyname, contactperson, email, phone, address, 
                industry, taxnumber, paymentterms, clientsince, status, accountmanagerid
            ]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error inserting client:", err);
        res.status(500).json({ error: err.message });
    }
});





app.post('/contract', async (req, res) => {
    const { 
        clientid, contractname, startdate, enddate, contractvalue, paymentschedule, termsandconditions, signeddate, signedbyclient, signedbycompany, status 
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO contracts 
            (clientid, contractname, startdate, enddate, contractvalue, paymentschedule, termsandconditions, signeddate, signedbyclient, signedbycompany, status) 
            VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
            RETURNING *`,
            [
                clientid, contractname, startdate, enddate, contractvalue, paymentschedule, termsandconditions, signeddate, signedbyclient, signedbycompany, status
            ]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error inserting contract:", err);
        res.status(500).json({ error: err.message });
    }
});


app.post('/task', async (req, res) => {
    const { 
        projectid, taskname, description, assignedto, assignedby, startdate, duedate, 
        estimatedhours, actualhours, priority, status, completionpercentage, notes 
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO tasks 
            (projectid, taskname, description, assignedto, assignedby, startdate, duedate, 
             estimatedhours, actualhours, priority, status, completionpercentage, notes) 
            VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
            RETURNING *`,
            [
                projectid, taskname, description, assignedto, assignedby, startdate, duedate, 
                estimatedhours, actualhours, priority, status, completionpercentage, notes
            ]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Database Insert Error:", err);
        res.status(500).json({ error: err.message });
    }
});



app.post('/team', async (req, res) => {
    const { teamname, departmentid, teamleadid, description, createdat } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO teams 
            (teamname, departmentid, teamleadid, description, createdat) 
            VALUES 
            ($1, $2, $3, $4, $5) 
            RETURNING *`,
            [teamname, departmentid, teamleadid, description, createdat]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error inserting team:", err);
        res.status(500).json({ error: err.message });
    }
});




const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Connect successfully...on PORT ${PORT}`);
});