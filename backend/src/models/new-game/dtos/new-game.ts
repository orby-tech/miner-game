import {
  IsInt,
  Min,
  Max,
  Validate,
  IsString,
  Length,
  NotContains,
  ValidationArguments,
} from 'class-validator';
import {
  DiamondCountValidation,
  IsOddValidation,
} from '../validators/new-game';
import { ApiProperty } from '@nestjs/swagger';

export class NewGameDto {
  @ApiProperty({
    type: Number,
    description: 'The side of the game board',
    minimum: 1,
    maximum: 6,
    example: 6,
  })
  @IsInt({
    always: true,
  })
  @Min(1)
  @Max(6)
  side: number;

  @ApiProperty({
    type: Number,
    description:
      'The number of diamonds on the game board, should be less than or equal to the square of the side',
    minimum: 1,
    maximum: 35,
    example: 5,
  })
  @IsInt({
    always: true,
  })
  @Min(1)
  @Max(36)
  @Validate(DiamondCountValidation)
  @Validate(IsOddValidation)
  diamondCount: number;
}

export class NewGameParamsDto {
  @ApiProperty({
    type: String,
    description: 'The room id',
    maxLength: 5,
    minLength: 5,
    example: '12345',
  })
  @IsString({
    always: true,
  })
  @Length(5)
  @NotContains(' ', {
    message: (validationArguments: ValidationArguments) =>
      `${validationArguments.property} should not contain a '${validationArguments.value}' string`,
  })
  roomId: string;
}
