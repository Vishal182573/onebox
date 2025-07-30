import Layout from "@/components/Layout";
import EmailList from "@/components/EmailList";
import EmailDetail from "@/components/EmailDetail";

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-1 overflow-hidden">
        <EmailList />
        <EmailDetail />
      </div>
    </Layout>
  );
}