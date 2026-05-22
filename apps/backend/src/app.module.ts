import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Seeder
import { SeederService } from './seeder/seeder.service';

// Auth
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';

// User
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

// Trainer Profile (marketplace)
import { TrainerProfileController } from './trainer-profile/trainer-profile.controller';
import { TrainerProfileService } from './trainer-profile/trainer-profile.service';

// Exercise Dictionary
import { ExerciseController } from './exercise/exercise.controller';
import { ExerciseService } from './exercise/exercise.service';
import { ExerciseAdminService } from './exercise/exercise-admin.service';

// Equipment
import { EquipmentController } from './equipment/equipment.controller';
import { EquipmentService } from './equipment/equipment.service';

// Muscle
import { MuscleController } from './muscle/muscle.controller';
import { MuscleService } from './muscle/muscle.service';

// Workout Plans
import { WorkoutController } from './workout/workout.controller';
import { WorkoutService } from './workout/workout.service';
import { WorkoutPlanAdminService } from './workout/workout-plan-admin.service';

// Sessions
import { SessionController } from './session/session.controller';
import { SessionService } from './session/session.service';

// Trainer CRM
import { TrainerController } from './trainer/trainer.controller';
import { TrainerService } from './trainer/trainer.service';

// Biometrics
import { BiometricController } from './biometric/biometric.controller';
import { BiometricService } from './biometric/biometric.service';

// Messaging & Chat
import { MessageController } from './message/message.controller';
import { MessageService } from './message/message.service';
import { ChatGateway } from './message/chat.gateway';

// Notifications
import { NotificationModule } from './notification/notification.module';
import { SupportModule } from './support/support.module';

@Module({
  imports: [NotificationModule, SupportModule],
  controllers: [
    AppController,
    AuthController,
    UserController,
    TrainerProfileController,
    ExerciseController,
    EquipmentController,
    MuscleController,
    WorkoutController,
    SessionController,
    TrainerController,
    BiometricController,
    MessageController,
  ],
  providers: [
    AppService,
    SeederService,
    AuthService,
    UserService,
    TrainerProfileService,
    ExerciseService,
    ExerciseAdminService,
    EquipmentService,
    MuscleService,
    WorkoutService,
    WorkoutPlanAdminService,
    SessionService,
    TrainerService,
    BiometricService,
    MessageService,
    ChatGateway,
  ],
})
export class AppModule {}
