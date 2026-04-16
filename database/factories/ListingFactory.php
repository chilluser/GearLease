<?php

namespace Database\Factories;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Listing>
 */
class ListingFactory extends Factory
{
    protected $model = Listing::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'category' => $this->faker->randomElement([
                '3Dprinters',
                'Audio & Sound Recording',
                'Camping & Expedition Gear',
                'Automotive',
                'Cinema Cameras',
                'Virtual Reality',
                'Tools',
                'Drones',
                'Electrical Gear',
                'Heavy Machinery',
                'Musical instruments',
            ]),
            'price_per_day' => $this->faker->randomNumber(2, 5, 100),
            'image_url' => $this->faker->imageUrl(640, 480, 'technics'),
            'seller_id' => User::factory(),
        ];
    }
}