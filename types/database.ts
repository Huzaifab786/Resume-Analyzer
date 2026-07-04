export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AnalysisStatus = "pending" | "completed" | "failed";
export type TailoredResumeStatus = "pending" | "completed" | "failed";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          resume_pdf_url: string | null;
          resume_filename: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          resume_pdf_url?: string | null;
          resume_filename?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          resume_pdf_url?: string | null;
          resume_filename?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      analyses: {
        Row: {
          id: string;
          user_id: string;
          job_title: string | null;
          company: string | null;
          job_description: string;
          match_score: number | null;
          result: Json | null;
          status: AnalysisStatus;
          error_message: string | null;
          tailored_resume_status: TailoredResumeStatus | null;
          tailored_resume_path: string | null;
          tailored_resume_content: Json | null;
          resume_template_id: string | null;
          changes_applied: Json | null;
          tailored_at: string | null;
          tailored_content_updated_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_title?: string | null;
          company?: string | null;
          job_description: string;
          match_score?: number | null;
          result?: Json | null;
          status?: AnalysisStatus;
          error_message?: string | null;
          tailored_resume_status?: TailoredResumeStatus | null;
          tailored_resume_path?: string | null;
          tailored_resume_content?: Json | null;
          resume_template_id?: string | null;
          changes_applied?: Json | null;
          tailored_at?: string | null;
          tailored_content_updated_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_title?: string | null;
          company?: string | null;
          job_description?: string;
          match_score?: number | null;
          result?: Json | null;
          status?: AnalysisStatus;
          error_message?: string | null;
          tailored_resume_status?: TailoredResumeStatus | null;
          tailored_resume_path?: string | null;
          tailored_resume_content?: Json | null;
          resume_template_id?: string | null;
          changes_applied?: Json | null;
          tailored_at?: string | null;
          tailored_content_updated_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analyses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Profile = Tables<"profiles">;
export type Analysis = Tables<"analyses">;
