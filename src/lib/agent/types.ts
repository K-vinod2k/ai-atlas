export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AgentResponse {
  content: string;
  navigateTo?: string;
}

export interface AgentProvider {
  name: string;
  chat(messages: AgentMessage[]): Promise<AgentResponse>;
}
