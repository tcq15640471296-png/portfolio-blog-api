/**
 * Static information about the portfolio owner and the project itself.
 * Edit these values to personalise the site (they are used by the Header,
 * Footer, Home page and the login/registration hints).
 */
export const site = {
  name: 'Tian Chengqi',
  nameZh: '田承琪',
  studentId: '24998024',
  role: 'Full-Stack Developer',
  course: 'Web Data Management and Application',
  projectTitle: 'Full-Stack Portfolio & Blog',
  email: '1310708365@qq.com',
  location: 'Shenyang, China',
  github: 'https://github.com/your-username',
  linkedin: 'https://www.linkedin.com/in/your-profile',
  intro:
    'I design and build data-driven web applications — from relational modelling and REST APIs to the React interfaces that use them. This site is the capstone submission for my Web Data Management and Application course.',
  highlights: [
    { label: 'REST endpoints', value: '20+' },
    { label: 'Mongoose models', value: '5' },
    { label: 'Stack', value: 'MERN' },
  ],
  nav: [
    { to: '/', label: 'Home' },
    { to: '/projects', label: 'Projects' },
    { to: '/blog', label: 'Blog' },
    { to: '/contact', label: 'Contact' },
  ],
}

export default site
