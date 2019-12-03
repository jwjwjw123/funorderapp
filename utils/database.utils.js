module.exports = { startTransaction, mkQuery, commit, rollback, mkQueryFromPool };

function startTransaction(connection) {
  return new Promise((resolve, reject) => {
    connection.beginTransaction(error => {
      console.log(error);
      if (error) {
        return reject({ connection, error });
      }
      resolve({ connection });
    })
  });
};

function mkQueryFromPool(mkQueryInstance, pool) {
  return params => {
    return new Promise((resolve, reject) => {
      pool.getConnection((error, connection) => {
        console.log(error);
        if (error) {
          return reject(error);
        }
        mkQueryInstance({ connection, params: params || [] })
          .then(status => resolve(status.result))
          .catch(status => reject(status.error))
          .finally(() => connection.release());
      })
    })
  };
}

function mkQuery(sql) {
  return status => {
    const connection = status.connection;
    const params = status.params || [];
    return new Promise((resolve, reject) => {
      connection.query(sql, params, (error, result) => {
        console.log(error);
        if (error) {
          return reject({ connection, error });
        }
        resolve({ connection, result });
      })
    });
  }
}

function commit(status) {
  return new Promise((resolve, reject) => {
    const connection = status.connection;
    console.info('in commit');
    connection.commit(error => {
      console.log(error);
      if (error) {
        connection.rollback();
        return reject({ connection, error });
      }
      resolve({ connection });
    });
  });
}

function rollback(status) {
  return new Promise((resolve, reject) => {
    const connection = status.connection;
    connection.rollback(error => {
      console.log('rollback >>>>> ', status.error);
      if (error) {
        return reject({ connection, error });
      }
      reject({ connection, error: status.error });
    });
  })
}
