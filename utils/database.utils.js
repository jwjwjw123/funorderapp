const startTransaction = (connection) => {
  return new Promise((resolve, reject) => {
    connection.beginTransaction(error => {
      if (error) {
        return reject({ connection, error });
      }
      resolve({ connection });
    })
  });
};

const mkQuery = (sql) => {
  return status => {
    const connection = status.connection;
    const params = status.params || [];
    return new Promise((resolve, reject) => {
      connection.query(sql, params, (error, result) => {
        if (error) {
          return reject({ connection, error });
        }
        resolve({ connection, result });
      })
    });
  }
}

const commit = (status) => {
  return new Promise((resolve, reject) => {
    const connection = status.connection;
    console.info('in commit');
    connection.commit(error => {
      if (error) {
        connection.rollback();
        return reject({ connection, error: error });
      }
      resolve({ connection });
    });
  });
}

const rollback = (status) => {
  return new Promise((resolve, reject) => {
    const connection = status.connection;
    connection.rollback(error => {
      console.log('rollback >>>>> ', error);
      if (error) {
        return reject({ connection, error });
      }
      reject({ connection, error: status.error });
    });
  })
}

module.exports = { startTransaction, mkQuery, commit, rollback };