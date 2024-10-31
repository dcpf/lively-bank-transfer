import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Account {

  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  balance: number;


}
