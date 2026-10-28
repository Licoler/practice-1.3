const { Op } = require('sequelize');

const {
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
} = require('./models');

// Преобразует экземпляры Sequelize в обычные объекты
// для удобного вывода результатов в терминал.
function toPlainData(rows) {
  return rows.map((row) => row.toJSON());
}

// ==================================================
// ЗАДАНИЕ 1. Пользователи с постами после даты
// ==================================================

async function getUsersWithRecentPosts() {
  return User.findAll({
    include: [
      {
        model: Post,
        as: 'posts',

        // Вложенный where фильтрует посты по дате.
        where: {
          publishedAt: {
            [Op.gt]: new Date('2023-01-01'),
          },
        },

        // INNER JOIN исключает пользователей без подходящих постов.
        required: true,
      },
    ],

    // Пользователи — по имени ASC,
    // посты внутри пользователя — по дате DESC.
    order: [
      ['name', 'ASC'],
      [{ model: Post, as: 'posts' }, 'publishedAt', 'DESC'],
    ],
  });
}

// ==================================================
// ЗАДАНИЕ 2. Все авторы, включая авторов без книг
// ==================================================

async function getAllAuthorsIncludingEmpty() {
  return Author.findAll({
    include: [
      {
        model: Book,
        as: 'books',

        // LEFT OUTER JOIN сохраняет авторов без книг.
        required: false,
      },
    ],

    // Сортировка авторов по фамилии по возрастанию.
    order: [['lastName', 'ASC']],
  });
}

// ==================================================
// ЗАДАНИЕ 3. Студенты, записанные на курсы с credits > 3
// ==================================================

async function getStudentsInAdvancedCourses() {
  return Student.findAll({
    include: [
      {
        model: Course,
        as: 'courses',

        // Выбираем только курсы, у которых credits больше 3.
        where: {
          credits: {
            [Op.gt]: 3,
          },
        },

        // Оставляем только студентов с подходящими курсами.
        required: true,

        // Не выводим поля соединительной таблицы Enrollment.
        through: {
          attributes: [],
        },
      },
    ],

    // Студенты — по имени ASC, курсы — по названию ASC.
    order: [
      ['name', 'ASC'],
      [{ model: Course, as: 'courses' }, 'title', 'ASC'],
    ],
  });
}

// ==================================================
// ЗАДАНИЕ 4. Заказы с товарами в количестве больше 2
// ==================================================

async function getOrdersWithBulkItems() {
  return Order.findAll({
    include: [
      {
        model: Item,
        as: 'items',

        // В заказ включаются только товары с quantity > 2.
        where: {
          quantity: {
            [Op.gt]: 2,
          },
        },

        // Заказы без подходящих товаров исключаются.
        required: true,
      },
    ],

    // Заказы — по дате создания DESC,
    // товары внутри заказа — по цене DESC.
    order: [
      ['createdAt', 'DESC'],
      [{ model: Item, as: 'items' }, 'price', 'DESC'],
    ],
  });
}

// ==================================================
// ЗАДАНИЕ 5. Активные пользователи с опубликованными постами
// ==================================================

async function getActiveUsersWithPublishedPosts() {
  return User.findAll({
    // Верхнеуровневый where фильтрует пользователей.
    where: {
      isActive: true,
    },

    include: [
      {
        model: Post,
        as: 'posts',

        // Вложенный where фильтрует посты по статусу.
        where: {
          status: 'published',
        },

        // Исключаем активных пользователей без опубликованных постов.
        required: true,
      },
    ],

    // Пользователи — по имени ASC,
    // опубликованные посты — по дате создания DESC.
    order: [
      ['name', 'ASC'],
      [{ model: Post, as: 'posts' }, 'createdAt', 'DESC'],
    ],
  });
}

// ==================================================
// ТЕСТОВЫЕ ДАННЫЕ
// ==================================================

async function seedDatabase() {
  // Пересоздаём таблицы и наполняем их тестовыми данными.
  await sequelize.sync({ force: true });

  // ---------- Пользователи ----------

  const user1 = await User.create({
    name: 'Алексей',
    email: 'alex@example.com',
    isActive: true,
  });

  const user2 = await User.create({
    name: 'Борис',
    email: 'boris@example.com',
    isActive: true,
  });

  // У Виктора нет постов. Он неактивен.
  await User.create({
    name: 'Виктор',
    email: 'victor@example.com',
    isActive: false,
  });

  await Post.bulkCreate([
    {
      title: 'Современный JavaScript',
      publishedAt: new Date('2024-05-10'),
      status: 'published',
      createdAt: new Date('2024-05-10'),
      authorId: user1.id,
    },
    {
      title: 'Основы Node.js',
      publishedAt: new Date('2023-06-15'),
      status: 'published',
      createdAt: new Date('2023-06-15'),
      authorId: user1.id,
    },
    {
      title: 'Черновик статьи',
      publishedAt: new Date('2024-07-01'),
      status: 'draft',
      createdAt: new Date('2024-07-01'),
      authorId: user2.id,
    },
  ]);

  // ---------- Авторы и книги ----------

  const author1 = await Author.create({
    firstName: 'Лев',
    lastName: 'Толстой',
    country: 'Россия',
  });

  const author2 = await Author.create({
    firstName: 'Фёдор',
    lastName: 'Достоевский',
    country: 'Россия',
  });

  // У Чехова нет книг.
  await Author.create({
    firstName: 'Антон',
    lastName: 'Чехов',
    country: 'Россия',
  });

  await Book.bulkCreate([
    {
      title: 'Война и мир',
      year: 1869,
      genre: 'Роман',
      authorId: author1.id,
    },
    {
      title: 'Анна Каренина',
      year: 1877,
      genre: 'Роман',
      authorId: author1.id,
    },
    {
      title: 'Преступление и наказание',
      year: 1866,
      genre: 'Роман',
      authorId: author2.id,
    },
  ]);

  // ---------- Студенты и курсы ----------

  const student1 = await Student.create({
    name: 'Иван',
    group: 'ИС-21',
  });

  const student2 = await Student.create({
    name: 'Мария',
    group: 'ИС-22',
  });

  // У Петра нет записей на курсы.
  await Student.create({
    name: 'Пётр',
    group: 'ИС-23',
  });

  const js = await Course.create({
    title: 'JavaScript',
    credits: 4,
  });

  const html = await Course.create({
    title: 'HTML',
    credits: 2,
  });

  const db = await Course.create({
    title: 'Базы данных',
    credits: 5,
  });

  await Enrollment.bulkCreate([
    {
      studentId: student1.id,
      courseId: js.id,
      grade: 5,
    },
    {
      studentId: student1.id,
      courseId: html.id,
      grade: 4,
    },
    {
      studentId: student2.id,
      courseId: db.id,
      grade: 5,
    },
  ]);

  // ---------- Заказы и товары ----------

  // Фиксированные даты позволяют проверить сортировку DESC.
  const order1 = await Order.create({
    number: 'ORD-001',
    status: 'paid',
    createdAt: new Date('2024-01-10'),
  });

  const order2 = await Order.create({
    number: 'ORD-002',
    status: 'new',
    createdAt: new Date('2024-02-15'),
  });

  await Item.bulkCreate([
    {
      productName: 'Клавиатура',
      quantity: 3,
      price: 2500,
      orderId: order1.id,
    },
    {
      productName: 'Мышь',
      quantity: 5,
      price: 1500,
      orderId: order1.id,
    },
    {
      productName: 'Монитор',
      quantity: 1,
      price: 18000,
      orderId: order2.id,
    },
    {
      productName: 'Наушники',
      quantity: 4,
      price: 4000,
      orderId: order2.id,
    },
  ]);
}

// ==================================================
// ЗАПУСК ВСЕХ ПЯТИ ЗАДАНИЙ
// ==================================================

async function main() {
  await seedDatabase();

  console.log('\nЗадание 1: пользователи с недавними постами');
  console.dir(toPlainData(await getUsersWithRecentPosts()), {
    depth: null,
  });

  console.log('\nЗадание 2: все авторы, включая авторов без книг');
  console.dir(toPlainData(await getAllAuthorsIncludingEmpty()), {
    depth: null,
  });

  console.log('\nЗадание 3: студенты с курсами, credits > 3');
  console.dir(toPlainData(await getStudentsInAdvancedCourses()), {
    depth: null,
  });

  console.log('\nЗадание 4: заказы с товарами, quantity > 2');
  console.dir(toPlainData(await getOrdersWithBulkItems()), {
    depth: null,
  });

  console.log('\nЗадание 5: активные пользователи с опубликованными постами');
  console.dir(toPlainData(await getActiveUsersWithPublishedPosts()), {
    depth: null,
  });
}

// При ошибке выводим её в терминал.
main().catch((error) => {
  console.error('Ошибка при выполнении:', error);
});