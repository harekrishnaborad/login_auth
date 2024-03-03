module.exports = {
    queries: async (sql_query) =>{
        let return_data = []
        
        for (let i = 0; i < sql_query.length; i++) {
            const element = sql_query[i];
    
            const mysql = require('mysql2/promise');
            const pool = mysql.createPool(
                { 
                    host: "127.0.0.1", 
                    user: "root", 
                    password: "codeM_0007", 
                    database: "student" 
                }
            );
            let data = await Promise.all([
                pool.query(element),
            ]);
            return_data.push(data[0][0])
            await pool.end();
        }
        return return_data
    }
}
