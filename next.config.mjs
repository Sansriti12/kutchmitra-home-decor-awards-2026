/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/dashboard/applicants",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/dashboard/applicant",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/dashboard/applicantportal",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/applicant",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/applicants",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/applicantportal",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/jury/dashboard",
        destination: "/jury/portal",
        permanent: false,
      },
      {
        source: "/jury/applications",
        destination: "/jury/portal",
        permanent: false,
      },
      {
        source: "/jury/evaluations",
        destination: "/jury/portal",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
