import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class ExternalComment {
  @PrimaryColumn()
  commentId: number;

  @Column({ nullable: true })
  questionnaireId: string;

  @Column({ nullable: true })
  externalServiceName: string;

  @Column({ type: 'boolean', default: false })
  isImported: boolean;

  // These will be auto-managed by TypeORM
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // The remaining fields stored as JSONB.
  @Column({ type: 'jsonb', nullable: true })
  commentPayload: {
    createdDate?: string;
    sender?: string;
    commentText?: string;
    rating?: number;
    feeling?: string;
    expeditionType?: string;
    items?: any;
  };
  id: any;
}
