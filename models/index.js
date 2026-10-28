const { DataTypes } = require('sequelize');
const sequelize = require('../database');

// User / Post

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

const Post = sequelize.define('Post', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
  },
});

// Author / Book 

const Author = sequelize.define('Author', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
  },
});

const Book = sequelize.define('Book', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
  },
  genre: {
    type: DataTypes.STRING,
  },
});

// Student / Course / Enrollment

const Student = sequelize.define('Student', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  group: {
    type: DataTypes.STRING,
  },
});

const Course = sequelize.define('Course', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  credits: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

const Enrollment = sequelize.define('Enrollment', {
  enrolledAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  grade: {
    type: DataTypes.INTEGER,
  },
});

// Order / Item

const Order = sequelize.define('Order', {
  number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('new', 'paid', 'shipped'),
    defaultValue: 'new',
  },
});

const Item = sequelize.define('Item', {
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
});

// Associations

// Один пользователь может иметь несколько постов.
User.hasMany(Post, {
  foreignKey: 'authorId',
  as: 'posts',
});

Post.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author',
});

// Один автор может иметь несколько книг.
Author.hasMany(Book, {
  foreignKey: 'authorId',
  as: 'books',
});

Book.belongsTo(Author, {
  foreignKey: 'authorId',
  as: 'author',
});

// Студенты и курсы связаны отношением многие-ко-многим.
Student.belongsToMany(Course, {
  through: Enrollment,
  foreignKey: 'studentId',
  otherKey: 'courseId',
  as: 'courses',
});

Course.belongsToMany(Student, {
  through: Enrollment,
  foreignKey: 'courseId',
  otherKey: 'studentId',
  as: 'students',
});

// Один заказ может содержать несколько товаров.
Order.hasMany(Item, {
  foreignKey: 'orderId',
  as: 'items',
});

Item.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order',
});

module.exports = {
  sequelize,
  User,
  Post,
  Author,
  Book,
  Student,
  Course,
  Enrollment,
  Order,
  Item,
};