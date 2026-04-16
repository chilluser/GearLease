<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Categories extends Model
{
    const defaultCategories = [
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
    ];

    public static function getDefaultCategories()
    {
        return self::defaultCategories;
    }

    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class);
    }
}