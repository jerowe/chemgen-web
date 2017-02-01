'use strict';

module.exports = {
  db: {
    name: 'db',
    connector: 'memory',
  },
  arrayscanDS: {
    connector: 'mssql',
    host: process.env.HCS_HOST,
    port: 1433,
    database: process.env.HCS_DB,
    username: process.env.HCS_USER,
    password: process.env.HCS_PASS,
  },
  chemgenDS: {
    name: 'chemgenDS',
    connector: 'memory',
  },
  wordpressDS: {
    name: 'wordpressDS',
    connector: 'memory',
  },
};
