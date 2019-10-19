var jwt = require('jwt-simple')

var auth = {    
    checkAuthenticated: (req, res, next) => {
        if (!req.header('authorization'))
            return res.status(401).send({ message: 'Unauthorized. Missing Auth Header' })

        var token = req.header('authorization').split(' ')[1]
        console.log(token)

        var payload = jwt.decode(token, '123')
        console.log(payload)

        if (!payload)
            return res.status(401).send({ message: 'Unauthorized. Auth Header Invalid' })

        req.userId = payload.sub

        next()
    }
}
module.exports = auth