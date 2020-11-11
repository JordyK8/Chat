const keywords = [
    {
        triggerWords: ['portfolio', 'resume', 'workexperience', 'work experience', 'work expample'],
        link: 'http://localhost:3000/resume',
        message: `May I suggest looking at this link to find out more about my work experience: http://localhost:3000/resume.`
    },
    {
        triggerWords: ['location', 'located', 'based', 'address', 'phone', 'email', 'contact'],
        link: 'http://localhost:3000/contact',
        message: `Are yo looking for my contact information? Try this link: http://localhost:3000/contact`
    }
]
module.exports = keywords