<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            '3D Printers',
            'Audio & Sound',
            'Camping',
            'Automotive',
            'Cinema Cameras',
            'Virtual Reality',
            'Tools',
            'Drones',
            'Electrical Gear',
            'Heavy Machinery',
            'Musical Instruments',
        ];

        foreach ($defaults as $name) {
            Category::firstOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($name)],
                ['name' => $name]
            );
        }
    }
}