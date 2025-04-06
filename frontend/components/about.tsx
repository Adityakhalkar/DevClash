import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 text-center"
        >
          <h1 className="text-5xl font-bold mb-4">About Our Team</h1>
          <p className="text-xl text-gray-300">
            We are a dynamic team of passionate technology professionals dedicated to delivering innovative solutions that drive results.
          </p>
        </motion.div>
      </section>

      {/* Who We Are Section */}
      <section className="py-20 bg-gray-900">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4"
        >
          <h2 className="text-4xl font-bold text-center mb-8">Who We Are</h2>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Our combined expertise in full-stack development and data science allows us to tackle complex challenges and create seamless experiences for our clients.
          </p>
        </motion.div>
      </section>

      {/* Meet Our Team Section */}
      <section className="py-20 bg-gray-800">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4"
        >
          <h2 className="text-4xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team Member Cards */}
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-gray-700 rounded-lg p-6 text-center shadow-lg transform hover:scale-105 transition-transform duration-300"
              >
                <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                <p className="text-gray-400 mb-4">{member.role}</p>
                <p className="text-gray-300">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Our Approach Section */}
      <section className="py-20 bg-gray-900">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4"
        >
          <h2 className="text-4xl font-bold text-center mb-8">Our Approach</h2>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            We believe in collaborative problem-solving and iterative development. By combining our technical expertise with a deep understanding of our clients&apos; needs, we create solutions that not only meet but exceed expectations.
          </p>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto mt-4">
            Our commitment to continuous learning ensures we stay at the forefront of technological advancements, implementing the latest tools and methodologies to deliver cutting-edge solutions.
          </p>
        </motion.div>
      </section>

      {/* Get in Touch Section */}
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 text-center"
        >
          <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
          <p className="text-lg text-gray-300 mb-8">
            Ready to work with our talented team? Contact us today to discuss how we can help bring your vision to life.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full transition duration-300">
            Contact Us
          </button>
        </motion.div>
      </section>
    </div>
  );
}

// Team Members Data
const teamMembers = [
  {
    name: "Prajwal",
    role: "Team Lead",
    bio: "With exceptional leadership skills and technical vision, Prajwal guides our team toward excellence.",
  },
  {
    name: "Aditya",
    role: "Full Stack Developer",
    bio: "Aditya brings extensive expertise in both frontend and backend technologies.",
  },
  {
    name: "Kashish",
    role: "Full Stack Developer",
    bio: "As a versatile developer proficient in multiple programming languages and frameworks, Kashish crafts intuitive user interfaces and scalable backend systems.",
  },
  {
    name: "Sanika",
    role: "Data Science Engineer",
    bio: "Sanika transforms complex data into actionable insights.",
  },
  {
    name: "Omkar",
    role: "Data Science Engineer",
    bio: "With a strong foundation in statistical analysis and predictive modeling, Omkar excels at identifying patterns and extracting meaningful information from data.",
  },
];