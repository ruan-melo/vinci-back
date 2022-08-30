import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';

describe('UsersController', () => {
  let controller: UsersController;
  const mockUsersService = {
    create: jest.fn((data: CreateUserDto) => {
      return {
        id: uuidv4(),
        name: data.name,
        email: data.email,
        profile_name: data.profile_name,
        password: data.password,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // it('should be able to create an user', async () => {
  //   const createUserDto: CreateUserDto = {
  //     name: 'John Doe',
  //     email: 'johndoe@gmail.com',
  //     password: '123456',
  //     profile_name: 'john_doe',
  //   };

  //   const result = await controller.create(createUserDto);

  //   expect(result).toEqual({
  //     id: expect.any(String),
  //     ...createUserDto,
  //     createdAt: expect.any(Date),
  //     updatedAt: expect.any(Date),
  //   });

  //   expect(mockUsersService.create).toHaveBeenCalled();
  // });
});
