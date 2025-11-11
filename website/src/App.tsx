import { useState } from 'react';
import Layout from './components/Layout';
import Introduction from './sections/Introduction';
import Concepts from './sections/Concepts';
import AgentForm from './sections/AgentForm';

type TabId = 'introduction' | 'concepts' | 'create';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('introduction');

  const tabs = [
    { id: 'introduction' as TabId, label: 'Introduction', icon: '🏠' },
    { id: 'concepts' as TabId, label: 'Concepts', icon: '💡' },
    { id: 'create' as TabId, label: 'Create Agent', icon: '🤖' },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as TabId);
  };

  return (
    <Layout activeTab={activeTab} tabs={tabs} onTabChange={handleTabChange}>
      {activeTab === 'introduction' && <Introduction />}
      {activeTab === 'concepts' && <Concepts />}
      {activeTab === 'create' && <AgentForm />}
    </Layout>
  );
}
