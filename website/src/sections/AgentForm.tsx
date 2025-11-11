import { useState, FormEvent } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import TagInput from '@/components/ui/TagInput';
import { agentFormSchema, AVAILABLE_PLUGINS, DEFAULT_FORM_VALUES } from '@/types/agent';
import type { AgentFormData } from '@/types';
import { createAgent } from '@/api/client';

export default function AgentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    username: '',
    bio: '',
    prompt: '',
    telegramToken: '',
    topics: [],
    avatar: '',
    plugins: DEFAULT_FORM_VALUES.plugins || [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AgentFormData, string>>>({});

  const handleInputChange = (field: keyof AgentFormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePluginToggle = (pluginId: string) => {
    const currentPlugins = formData.plugins || [];
    const newPlugins = currentPlugins.includes(pluginId)
      ? currentPlugins.filter((p) => p !== pluginId)
      : [...currentPlugins, pluginId];
    handleInputChange('plugins', newPlugins);
  };

  const validateForm = (): boolean => {
    try {
      agentFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: Array<{ path: string[]; message: string }> };
        const newErrors: Partial<Record<keyof AgentFormData, string>> = {};
        zodError.errors.forEach((err) => {
          const field = err.path[0] as keyof AgentFormData;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fix the errors in the form',
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const result = await createAgent(formData);
      setSubmitStatus({
        type: 'success',
        message: `Agent "${result.name}" created successfully! Agent ID: ${result.agentId}`,
      });

      // Reset form on success
      setTimeout(() => {
        setFormData({
          name: '',
          username: '',
          bio: '',
          prompt: '',
          telegramToken: '',
          topics: [],
          avatar: '',
          plugins: DEFAULT_FORM_VALUES.plugins || [],
        });
      }, 3000);
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create agent',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      username: '',
      bio: '',
      prompt: '',
      telegramToken: '',
      topics: [],
      avatar: '',
      plugins: DEFAULT_FORM_VALUES.plugins || [],
    });
    setErrors({});
    setSubmitStatus(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold text-white">Create Your Agent</h2>
        <p className="text-gray-300">
          Fill out the form below to configure and deploy your That Me agent
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <h3 className="text-xl font-semibold text-white mb-6">Basic Information</h3>
          <div className="space-y-4">
            <Input
              label="Agent Name"
              placeholder="My Assistant"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              required
            />

            <Input
              label="Username"
              placeholder="my_assistant"
              helperText="Optional username for your agent"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              error={errors.username}
            />

            <Textarea
              label="Bio"
              placeholder="A helpful AI assistant that..."
              helperText="Brief description of your agent (optional)"
              value={formData.bio as string}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              error={errors.bio as string}
              rows={3}
            />

            <Input
              label="Avatar URL"
              placeholder="https://example.com/avatar.png"
              helperText="Optional image URL for your agent's avatar"
              value={formData.avatar}
              onChange={(e) => handleInputChange('avatar', e.target.value)}
              error={errors.avatar}
            />
          </div>
        </Card>

        {/* Configuration */}
        <Card>
          <h3 className="text-xl font-semibold text-white mb-6">Agent Configuration</h3>
          <div className="space-y-4">
            <Textarea
              label="System Prompt"
              placeholder="You are a helpful AI assistant that..."
              helperText="Define your agent's personality and behavior"
              value={formData.prompt}
              onChange={(e) => handleInputChange('prompt', e.target.value)}
              error={errors.prompt}
              rows={6}
              required
            />

            <TagInput
              label="Topics"
              value={formData.topics || []}
              onChange={(tags) => handleInputChange('topics', tags)}
              placeholder="Press Enter to add topics"
              helperText="Topics your agent specializes in (e.g., tech, finance, health)"
              error={errors.topics as string}
            />
          </div>
        </Card>

        {/* Telegram Integration */}
        <Card>
          <h3 className="text-xl font-semibold text-white mb-6">Telegram Integration</h3>
          <div className="space-y-4">
            <Input
              label="Telegram Bot Token"
              placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
              helperText="Get this from @BotFather on Telegram"
              value={formData.telegramToken}
              onChange={(e) => handleInputChange('telegramToken', e.target.value)}
              error={errors.telegramToken}
              required
            />
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-300 mb-2">
                <strong>How to get a Telegram Bot Token:</strong>
              </p>
              <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                <li>Open Telegram and search for @BotFather</li>
                <li>Send the command /newbot</li>
                <li>Follow the prompts to create your bot</li>
                <li>Copy the bot token provided by BotFather</li>
              </ol>
            </div>
          </div>
        </Card>

        {/* Plugins */}
        <Card>
          <h3 className="text-xl font-semibold text-white mb-6">Plugins</h3>
          <p className="text-sm text-gray-400 mb-4">
            Select additional plugins to extend your agent's capabilities
          </p>
          <div className="space-y-2">
            {AVAILABLE_PLUGINS.map((plugin) => (
              <label
                key={plugin.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-900 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.plugins?.includes(plugin.id)}
                  onChange={() => handlePluginToggle(plugin.id)}
                  disabled={plugin.required}
                  className="mt-1 w-4 h-4 rounded border-gray-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 disabled:opacity-50"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{plugin.name}</span>
                    {plugin.required && (
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{plugin.description}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Submit Status */}
        {submitStatus && (
          <Card
            variant="bordered"
            className={
              submitStatus.type === 'success'
                ? 'border-green-500 bg-green-950/20'
                : 'border-red-500 bg-red-950/20'
            }
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">
                {submitStatus.type === 'success' ? '✅' : '❌'}
              </span>
              <p
                className={
                  submitStatus.type === 'success' ? 'text-green-400' : 'text-red-400'
                }
              >
                {submitStatus.message}
              </p>
            </div>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset Form
          </Button>
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? 'Creating Agent...' : 'Create Agent'}
          </Button>
        </div>
      </form>

      {/* Info Card */}
      <Card variant="bordered" className="bg-primary-950/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="text-sm text-gray-300 space-y-2">
            <p>
              <strong className="text-white">Note:</strong> Your agent will be deployed to the
              backend API and will be ready to use via Telegram once created.
            </p>
            <p>
              After creation, you can start chatting with your agent on Telegram by searching for
              the bot username provided by @BotFather.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
