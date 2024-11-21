<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $branches = [
            ['branch_code' => 'AKLA', 'branch_name' => 'AKLAN', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'ALEN', 'branch_name' => 'ALLEN', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'ANTI', 'branch_name' => 'ANTIQUE', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'BANTA', 'branch_name' => 'BANTA', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'BAYB', 'branch_name' => 'BAYBAY', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'BIÑAN', 'branch_name' => 'BIÑAN', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'BOHK', 'branch_name' => 'KIA BOHOL', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'BOHL', 'branch_name' => 'BOHOL LOGISTIC', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'CAGL', 'branch_name' => 'CAGAYAN LOGISTICS', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'CALAP', 'branch_name' => 'CALAPE', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'CALAP2', 'branch_name' => 'CALAPE 2', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'CALI', 'branch_name' => 'CALINAN', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'CARMB', 'branch_name' => 'CARMEN BOHOL', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'CARMO', 'branch_name' => 'CARMONA', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'CARS', 'branch_name' => 'CARCAR', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'CATAR', 'branch_name' => 'CATARMAN', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'DASMA', 'branch_name' => 'DASMARIÑAS', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'DIPL', 'branch_name' => 'DIPOLOG LOGISTICS', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'FAMY', 'branch_name' => 'FAMY', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'GUIN', 'branch_name' => 'GUINDULMAN', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'GUIN2', 'branch_name' => 'GUINDULMAN 2', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'JAGN', 'branch_name' => 'JAGNA', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'LIPA', 'branch_name' => 'LIPA', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'LOAY', 'branch_name' => 'LOAY', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'MADRI', 'branch_name' => 'MADRIDEJOS', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'MALA', 'branch_name' => 'MALAYBALAY', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'MANG', 'branch_name' => 'MANGA', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'MANL', 'branch_name' => 'MANDAUE LOGISTICS', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'MANP', 'branch_name' => 'MANDAUE SURPLUS', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'MOLS', 'branch_name' => 'MOLAVE', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'NAIC', 'branch_name' => 'NAIC', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'OZAL', 'branch_name' => 'OZAMIZ LOGISTICS', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'PAGS', 'branch_name' => 'PAGSANJAN', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'SAGBA', 'branch_name' => 'SAGBAYAN', 'branch' => 'Strong Moto Centrum, Inc.', 'acronym' => 'SMCT'],
            ['branch_code' => 'ILIG', 'branch_name' => 'ILIGAN', 'branch' => 'Des Strong Motors, Inc.', 'acronym' => 'DSM'],
            ['branch_code' => 'JIMN', 'branch_name' => 'JIMENEZ', 'branch' => 'Des Strong Motors, Inc.', 'acronym' => 'DSM'],
            ['branch_code' => 'CARMC2', 'branch_name' => 'CARMEN 2', 'branch' => 'Des Strong Motors, Inc.', 'acronym' => 'DSM'],
        ];

        foreach ($branches as &$branch) {
            $branch['created_at'] = now();
            $branch['updated_at'] = now();
        }

        DB::table('branches')->insert($branches);
    }
}
