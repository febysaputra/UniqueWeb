var Sequelize = require('sequelize');

module.exports = new Sequelize('d2q6nmqn2o5u1b', 'afeggcexeybyyg', '781bc64a56fa03c47c9d75d16ca1c590e93e5aa90f675bf5e507dbe9292c4530', {//database, username, passwotd
	host: 'ec2-23-23-243-111.compute-1.amazonaws.com',
	dialect: 'postgres',
	pool: {
		max: 5,
		min: 0,
		idle: 3600
	},
	timezone: '+07:00',
	logging: false,
	dialectOptions: {
    	ssl: true
  	}
});

/*module.exports = new Sequelize('postgres://postgres:bismillah@localhost:5432/postgres');*/