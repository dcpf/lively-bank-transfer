import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Account } from "../account/entity";

@Entity()
export class Transfer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => Account)
  fromAccount: Account

  @ManyToOne((type) => Account)
  toAccount: Account

  @Column('int')
  amount: number;

  @Column('text', {nullable: true})
  state: any;

}
