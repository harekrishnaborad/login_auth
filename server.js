// const mysql = require('mysql2/promise');
// const session = require('express-session');
// const MySQLStore = require('express-mysql-session')(session);

// const options = {
//     host: '127.0.0.1',
//     // port: 3306,
//     user: 'root',
//     password: 'codeM_0007',
//     database: 'student'
// };

// const connection = mysql.createPool(options);
// const sessionStore = new MySQLStore(options, connection);

// sessionStore.onReady().then(() => {
// 	// MySQL session store ready for use.
// 	console.log('MySQLStore ready');
// }).catch(error => {
// 	// Something went wrong.
// 	console.error(error);
// });

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`)
// })

const express = require('express');
const app = module.exports = express();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcryptjs')
const dbs = require('./models/dbs')

const PORT = 2121
const options = {
	host: '127.0.0.1',
	// port: 3306,
	user: 'root',
	password: 'codeM_0007',
	database: 'cookies',
    schema: {
		tableName: 'sessions',
		columnNames: {
			session_id: 'session_id',
			expires: 'expires',
			data: 'data'
		}
	}
};

const sessionStore = new MySQLStore(options);

app.use(session({
	key: 'session_cookie_name',
	secret: 'session_cookie_secret',
	store: sessionStore,
	resave: false,
	saveUninitialized: false
}));

// Optionally use onReady() to get a promise that resolves when store is ready.
sessionStore.onReady().then(() => {
	// MySQL session store ready for use.
	console.log('MySQLStore ready');
}).catch(error => {
	// Something went wrong.
	console.error(error);
});

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const isAuth = (req, res, next) => {
    if(req.session.isAuth){
        next()
    }else{
        res.redirect('/login')
    }
}

const noLoggin = (req, res, next) => {
    if(req.session.isAuth){
        res.redirect('/secret')
    }else{
        res.render('login.ejs')
    }
}

app.get('/', (req, res) => {
    // req.session.isAuth = true;
    res.render('home.ejs')
})

app.get('/register', (req, res) => {
    // req.session.isAuth = true;
    res.render('register.ejs')
})


app.post('/add_user', async(req, res) =>{
    const {username, email, password} = req.body
    console.log({username, email, password})

    let user = await dbs.queries([`select * from user where email = '${email}'`])
    console.log(user[0])
    if(user[0] == []){
        return res.redirect('/register')
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    await dbs.queries([`insert into user values('${username}', '${email}', '${hashedPassword}', '${req.body.role}');`])

    res.redirect('/login')
})


app.get('/login', noLoggin,(req, res) => {
    // req.session.isAuth = true;
    res.render('login.ejs')
})

app.post('/checkUsers', async(req, res) =>{
    const {email, password} = req.body
    let user = await dbs.queries([`select * from user where email = '${email}'`])
    console.log(user[0][0])

    if(user[0][0] == []){
        return res.redirect('/login')
    }

    const isMatch = await bcrypt.compare(password, user[0][0].password)
    console.log(isMatch)

    if(isMatch[0] == []){
        return res.redirect('/login')
    }

    req.session.isAuth = true;
    res.redirect('/secret');
})

app.get('/secret', isAuth,(req, res) => {
    res.render('secret.ejs')
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})